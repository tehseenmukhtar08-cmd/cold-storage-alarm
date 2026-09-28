from flask import Flask, render_template, request, jsonify, redirect

import pyodbc

app = Flask(__name__)


# ==========================================
# SQL Server Connection
# ==========================================

def get_connection():

    connection = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=DESKTOP-SISRR1U\\SQLEXPRESS;"
        "DATABASE=ColdStorageDB;"
        "Trusted_Connection=yes;"
    )

    return connection


# ==========================================
# Home Page
# ==========================================

@app.route("/")
def home():

    return render_template("index.html")


# ==========================================
# Save Alarm
# ==========================================

@app.route("/save_alarm", methods=["POST"])
def save_alarm():

    try:

        data = request.get_json()

        alarm_type = data["alarm_type"]
        peak_temperature = data["peak_temperature"]
        duration_seconds = data["duration_seconds"]

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO AlarmHistory
            (
                AlarmType,
                PeakTemperature,
                DurationSeconds
            )
            VALUES (?, ?, ?)
            """,
            alarm_type,
            peak_temperature,
            duration_seconds
        )

        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({
            "success": True,
            "message": "Alarm saved successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# Alarm History
# ==========================================

@app.route("/alarm_history")
def alarm_history():

    try:

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                AlarmID,
                AlarmType,
                PeakTemperature,
                DurationSeconds,
                AlarmTime
            FROM AlarmHistory
            ORDER BY AlarmID DESC
            """
        )

        alarms = cursor.fetchall()

        cursor.close()
        connection.close()

        return render_template(
            "alarm_history.html",
            alarms=alarms
        )

    except Exception as e:

        return "Database Error: " + str(e)


# ==========================================
# Delete Alarm
# ==========================================

@app.route("/delete_alarm/<int:alarm_id>", methods=["POST"])
def delete_alarm(alarm_id):

    try:

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM AlarmHistory
            WHERE AlarmID = ?
            """,
            (alarm_id,)
        )

        connection.commit()

        cursor.close()
        connection.close()

        return redirect("/alarm_history")

    except Exception as e:

        return "Database Error: " + str(e)


# ==========================================
# Run Flask
# ==========================================

if __name__ == "__main__":

    app.run(debug=True)