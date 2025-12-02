#!/usr/bin/env python3
import json
import random
import secrets
import sqlite3
import string
from datetime import datetime, timedelta
from pathlib import Path

import bcrypt

DB_PATH = Path(__file__).resolve().parent / "database.db"

COMPANIES = [
    {
        "id": 1,
        "name": "ASML",
        "address": "De Run 6501, 5504 DR Veldhoven",
        "domain": "asml.com",
        "phone_area": "40",
        "team_prefix": "ASML",
        "room_label": "Veldhoven Lab",
        "event_desc": "Lithografie roadmap-sync met productlijnen.",
    },
    {
        "id": 2,
        "name": "Philips",
        "address": "High Tech Campus 52, 5656 AG Eindhoven",
        "domain": "philips.com",
        "phone_area": "40",
        "team_prefix": "Philips",
        "room_label": "Innovation Hub",
        "event_desc": "Health-tech concept review met clinical insights.",
    },
    {
        "id": 3,
        "name": "Heineken",
        "address": "Stadhouderskade 78, 1072 AE Amsterdam",
        "domain": "heineken.com",
        "phone_area": "20",
        "team_prefix": "Heineken",
        "room_label": "Brew Lab",
        "event_desc": "Brouwportfolio en merkactivatie afstemming.",
    },
    {
        "id": 4,
        "name": "ING",
        "address": "Bijlmerdreef 106, 1102 CT Amsterdam",
        "domain": "ing.com",
        "phone_area": "20",
        "team_prefix": "ING",
        "room_label": "Orange Studio",
        "event_desc": "Fintech release readiness en risk alignment.",
    },
    {
        "id": 5,
        "name": "Bol.com",
        "address": "Papendorpseweg 100, 3528 BJ Utrecht",
        "domain": "bol.com",
        "phone_area": "30",
        "team_prefix": "Bol.com",
        "room_label": "Logistiek Studio",
        "event_desc": "E-commerce fulfillment en campagneplanning.",
    },
]

COMPANY_IDS = [c["id"] for c in COMPANIES]
COMPANY_META = {c["id"]: c for c in COMPANIES}

USER_COUNT = 80
ROOM_COUNT = 40
TEAM_COUNT = 30
EVENT_COUNT = 50
PASSWORD_LENGTH = 12
PASSWORD_LOG_PATH = Path("generated_passwords.csv")

FIRST_NAMES = [
    "Anouk",
    "Bram",
    "Cedric",
    "Daan",
    "Evi",
    "Fleur",
    "Gijs",
    "Hanne",
    "Ilse",
    "Joram",
    "Kiki",
    "Lars",
    "Maud",
    "Niek",
    "Olaf",
    "Puk",
    "Quin",
    "Rosa",
    "Sven",
    "Tessa",
]

LAST_NAMES = [
    "Aalbers",
    "Bakker",
    "Cornelissen",
    "De Bruin",
    "Elders",
    "Flierman",
    "Gerrits",
    "Hoekstra",
    "IJsselstein",
    "Jongerius",
    "Koopal",
    "Lamers",
    "Meijer",
    "Noordzij",
    "Oerlemans",
    "Peeters",
    "Querido",
    "Rietveld",
    "Schaap",
    "Timmer",
]

ROLES = ["admin", "manager", "staff"]
JOB_TITLES = [
    "Consultant",
    "Projectleider",
    "Data Engineer",
    "UX Researcher",
    "Frontend Developer",
    "Backend Developer",
    "Product Owner",
]


def generate_password():
    alphabet = string.ascii_letters + string.digits + "!@#$%?"
    return "".join(secrets.choice(alphabet) for _ in range(PASSWORD_LENGTH))


def build_users():
    users = []
    company_users = {c["id"]: [] for c in COMPANIES}
    credentials = []
    for idx in range(1, USER_COUNT + 1):
        company_id = COMPANY_IDS[(idx - 1) % len(COMPANY_IDS)]
        company_info = COMPANY_META[company_id]
        first = FIRST_NAMES[(idx - 1) % len(FIRST_NAMES)]
        last = LAST_NAMES[(idx - 1) % len(LAST_NAMES)]
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{idx}@{company_info['domain']}"
        phone = "+31 {} {:03d} {:04d}".format(
            company_info["phone_area"], 500 + (idx % 400), 1000 + idx
        )
        role = ROLES[idx % len(ROLES)]
        job_title = JOB_TITLES[idx % len(JOB_TITLES)]
        plain_password = generate_password()
        password_hash = bcrypt.hashpw(
            plain_password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        users.append(
            (
                idx,
                name,
                role,
                email,
                phone,
                password_hash,
                company_id,
                job_title,
            )
        )
        company_users[company_id].append(idx)
        credentials.append((idx, email, plain_password))
    return users, company_users, credentials


def build_rooms():
    rooms = []
    company_rooms = {c["id"]: [] for c in COMPANIES}
    base = ROOM_COUNT // len(COMPANIES)
    extra = ROOM_COUNT % len(COMPANIES)
    room_id = 1
    for idx, company in enumerate(COMPANIES):
        count = base + (1 if idx < extra else 0)
        for i in range(count):
            capacity = 8 + ((room_id + i) * 3) % 24
            location = f"{company['room_label']} {i + 1:02d}"
            rooms.append((room_id, capacity, location, company["id"]))
            company_rooms[company["id"]].append(room_id)
            room_id += 1
    return rooms, company_rooms


def build_teams(company_users):
    teams = []
    random.seed(42)
    for idx in range(1, TEAM_COUNT + 1):
        company_id = COMPANY_IDS[(idx - 1) % len(COMPANY_IDS)]
        pool = company_users[company_id]
        member_count = 4 + (idx % 3)  # between 4 and 6 members
        members = random.sample(pool, member_count)
        lead_id = members[0]
        member_ids = json.dumps(members)
        prefix = COMPANY_META[company_id]["team_prefix"]
        team_name = f"{prefix} Team {idx:02d}"
        teams.append((idx, team_name, lead_id, member_ids))
    return teams


def build_events(company_users, company_rooms):
    events = []
    attendee_rows = []
    base_start = datetime(2025, 4, 1, 9, 0, 0)
    random.seed(84)
    for idx in range(1, EVENT_COUNT + 1):
        company_id = COMPANY_IDS[(idx - 1) % len(COMPANY_IDS)]
        day_offset = idx // 2
        hour_offset = (idx % 4) * 2
        start = base_start + timedelta(days=day_offset, hours=hour_offset)
        end = start + timedelta(hours=2, minutes=30)
        pool_users = company_users[company_id]
        pool_rooms = company_rooms[company_id]
        attendee_count = 5 + (idx % 4)  # between 5 and 8 attendees
        attendee_ids = random.sample(pool_users, attendee_count)
        organizer_id = random.choice(attendee_ids)
        room_sample_size = 1 if idx % 3 else 2
        rooms = random.sample(pool_rooms, room_sample_size)
        description = COMPANY_META[company_id]["event_desc"]
        name = f"Planningsmoment #{idx:03d}"
        events.append(
            (
                idx,
                start.strftime("%Y-%m-%d %H:%M:%S"),
                end.strftime("%Y-%m-%d %H:%M:%S"),
                description,
                name,
                organizer_id,
                json.dumps(sorted(rooms)),
            )
        )
        attendee_rows.extend((idx, user_id) for user_id in attendee_ids)
    return events, attendee_rows


def write_password_report(credentials):
    rows = ["user_id,email,password"]
    for user_id, email, password in credentials:
        rows.append(f"{user_id},{email},{password}")
    PASSWORD_LOG_PATH.write_text("\n".join(rows), encoding="utf-8")


def main():
    users, company_users, credentials = build_users()
    rooms, company_rooms = build_rooms()
    teams = build_teams(company_users)
    events, attendees = build_events(company_users, company_rooms)

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cur = conn.cursor()
    cur.execute("BEGIN;")
    for table in ("attendee", "event", "team", "room", "user", "company"):
        cur.execute(f"DELETE FROM {table};")

    cur.executemany(
        "INSERT INTO company (id, name, address) VALUES (?, ?, ?)",
        [(c["id"], c["name"], c["address"]) for c in COMPANIES],
    )
    cur.executemany(
        """
        INSERT INTO user
        (id, name, role, email, phone_number, password_hash, company_id, job_title)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        users,
    )
    cur.executemany(
        "INSERT INTO room (id, capacity, location, company_id) VALUES (?, ?, ?, ?)",
        rooms,
    )
    cur.executemany(
        "INSERT INTO team (id, name, lead_id, member_ids) VALUES (?, ?, ?, ?)",
        teams,
    )
    cur.executemany(
        """
        INSERT INTO event
        (id, start_time, end_time, description, name, organizer_id, room_ids)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        events,
    )
    cur.executemany(
        "INSERT INTO attendee (event_id, user_id) VALUES (?, ?)",
        attendees,
    )
    conn.commit()
    conn.close()
    write_password_report(credentials)


if __name__ == "__main__":
    main()
