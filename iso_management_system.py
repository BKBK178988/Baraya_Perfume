#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ระบบจัดการ ISO Management System
รองรับการจัดการเอกสาร, การตรวจสอบ, การปฏิบัติตามข้อกำหนด และการตรวจประเมิน
"""

import sqlite3
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import json


class ISODatabase:
    """จัดการฐานข้อมูลสำหรับระบบ ISO"""
    
    def __init__(self, db_name: str = "iso_management.db"):
        self.db_name = db_name
        self.conn = None
        self.create_database()
    
    def create_database(self):
        """สร้างฐานข้อมูลและตารางต่างๆ"""
        self.conn = sqlite3.connect(self.db_name)
        cursor = self.conn.cursor()
        
        # ตารางผู้ใช้งาน
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT,
                role TEXT NOT NULL,
                department TEXT,
                created_date TEXT NOT NULL,
                is_active INTEGER DEFAULT 1
            )
        ''')
        
        # ตารางเอกสาร
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_number TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                version TEXT NOT NULL,
                status TEXT NOT NULL,
                owner_id INTEGER,
                created_date TEXT NOT NULL,
                modified_date TEXT NOT NULL,
                expiry_date TEXT,
                file_path TEXT,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        ''')
        
        # ตารางประวัติเอกสาร
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS document_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                version TEXT NOT NULL,
                modified_by INTEGER,
                modified_date TEXT NOT NULL,
                change_description TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id),
                FOREIGN KEY (modified_by) REFERENCES users(id)
            )
        ''')
        
        # ตารางข้อกำหนดการปฏิบัติตาม
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS compliance_requirements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requirement_code TEXT UNIQUE NOT NULL,
                iso_standard TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                status TEXT NOT NULL,
                responsible_id INTEGER,
                due_date TEXT,
                completion_date TEXT,
                created_date TEXT NOT NULL,
                FOREIGN KEY (responsible_id) REFERENCES users(id)
            )
        ''')
        
        # ตารางการตรวจประเมิน
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                audit_number TEXT UNIQUE NOT NULL,
                audit_type TEXT NOT NULL,
                iso_standard TEXT NOT NULL,
                title TEXT NOT NULL,
                scheduled_date TEXT NOT NULL,
                completion_date TEXT,
                auditor_id INTEGER,
                department TEXT,
                status TEXT NOT NULL,
                findings_count INTEGER DEFAULT 0,
                created_date TEXT NOT NULL,
                FOREIGN KEY (auditor_id) REFERENCES users(id)
            )
        ''')
        
        # ตารางข้อตรวจพบ
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_findings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                audit_id INTEGER,
                finding_number TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                requirement_reference TEXT,
                corrective_action TEXT,
                responsible_id INTEGER,
                due_date TEXT,
                completion_date TEXT,
                status TEXT NOT NULL,
                created_date TEXT NOT NULL,
                FOREIGN KEY (audit_id) REFERENCES audits(id),
                FOREIGN KEY (responsible_id) REFERENCES users(id)
            )
        ''')
        
        # ตารางการฝึกอบรม
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS training_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                training_title TEXT NOT NULL,
                iso_standard TEXT,
                training_date TEXT NOT NULL,
                duration_hours REAL,
                trainer TEXT,
                status TEXT NOT NULL,
                certificate_path TEXT,
                expiry_date TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        self.conn.commit()
        self._insert_sample_data()
    
    def _insert_sample_data(self):
        """เพิ่มข้อมูลตัวอย่างเริ่มต้น"""
        cursor = self.conn.cursor()
        
        # ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            # เพิ่มผู้ใช้งานตัวอย่าง
            sample_users = [
                ('admin', 'ผู้ดูแลระบบ', 'admin@company.com', 'Admin', 'IT', datetime.now().isoformat()),
                ('quality_mgr', 'ผู้จัดการฝ่ายคุณภาพ', 'quality@company.com', 'Manager', 'Quality Assurance', datetime.now().isoformat()),
                ('auditor1', 'ผู้ตรวจประเมินหลัก', 'auditor@company.com', 'Auditor', 'Quality Assurance', datetime.now().isoformat()),
                ('doc_ctrl', 'เจ้าหน้าที่เอกสาร', 'doc@company.com', 'Document Controller', 'Quality Assurance', datetime.now().isoformat()),
            ]
            cursor.executemany('''
                INSERT INTO users (username, full_name, email, role, department, created_date)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', sample_users)
            
            # เพิ่มข้อกำหนดตัวอย่าง
            sample_requirements = [
                ('ISO9001-4.1', 'ISO 9001:2015', 'ทำความเข้าใจองค์กรและบริบท', 'ต้องวิเคราะห์ปัจจัยภายในและภายนอกที่มีผลต่อระบบ', 'Context', 'Compliant', 2, None, datetime.now().isoformat(), datetime.now().isoformat()),
                ('ISO9001-7.5', 'ISO 9001:2015', 'การควบคุมเอกสาร', 'ต้องมีระบบการควบคุมเอกสารที่มีประสิทธิภาพ', 'Documentation', 'Compliant', 4, None, datetime.now().isoformat(), datetime.now().isoformat()),
                ('ISO14001-6.1', 'ISO 14001:2015', 'การประเมินความเสี่ยงด้านสิ่งแวดล้อม', 'ระบุและประเมินความเสี่ยงด้านสิ่งแวดล้อม', 'Risk Management', 'Pending', 2, (datetime.now() + timedelta(days=30)).isoformat(), None, datetime.now().isoformat()),
                ('ISO27001-5.1', 'ISO 27001:2022', 'นโยบายความมั่นคงปลอดภัยสารสนเทศ', 'จัดทำและทบทวนนโยบายความมั่นคงปลอดภัย', 'Security', 'Non-Compliant', 2, (datetime.now() + timedelta(days=15)).isoformat(), None, datetime.now().isoformat()),
            ]
            cursor.executemany('''
                INSERT INTO compliance_requirements (requirement_code, iso_standard, title, description, 
                    category, status, responsible_id, due_date, completion_date, created_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', sample_requirements)
            
            self.conn.commit()
    
    def close(self):
        """ปิดการเชื่อมต่อฐานข้อมูล"""
        if self.conn:
            self.conn.close()


class DocumentManager:
    """จัดการเอกสารในระบบ ISO"""
    
    def __init__(self, db: ISODatabase):
        self.db = db
    
    def create_document(self, doc_number: str, title: str, category: str, 
                       owner_id: int, description: str = "", file_path: str = "") -> bool:
        """สร้างเอกสารใหม่"""
        try:
            cursor = self.db.conn.cursor()
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO documents (doc_number, title, description, category, version, 
                    status, owner_id, created_date, modified_date, file_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (doc_number, title, description, category, '1.0', 'Draft', 
                  owner_id, now, now, file_path))
            
            doc_id = cursor.lastrowid
            
            # บันทึกประวัติ
            cursor.execute('''
                INSERT INTO document_history (document_id, version, modified_by, modified_date, change_description)
                VALUES (?, ?, ?, ?, ?)
            ''', (doc_id, '1.0', owner_id, now, 'สร้างเอกสารเริ่มต้น'))
            
            self.db.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def update_document(self, doc_id: int, user_id: int, **kwargs) -> bool:
        """อัปเดตเอกสาร"""
        try:
            cursor = self.db.conn.cursor()
            
            # ดึงข้อมูลเดิม
            cursor.execute('SELECT version FROM documents WHERE id = ?', (doc_id,))
            result = cursor.fetchone()
            if not result:
                return False
            
            old_version = result[0]
            
            # สร้างคำสั่ง UPDATE
            update_fields = []
            values = []
            
            for key, value in kwargs.items():
                if key in ['title', 'description', 'category', 'status', 'expiry_date', 'file_path']:
                    update_fields.append(f"{key} = ?")
                    values.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("modified_date = ?")
            values.append(datetime.now().isoformat())
            values.append(doc_id)
            
            cursor.execute(f'''
                UPDATE documents SET {', '.join(update_fields)}
                WHERE id = ?
            ''', values)
            
            # บันทึกประวัติ
            change_desc = f"อัปเดต: {', '.join(kwargs.keys())}"
            cursor.execute('''
                INSERT INTO document_history (document_id, version, modified_by, modified_date, change_description)
                VALUES (?, ?, ?, ?, ?)
            ''', (doc_id, old_version, user_id, datetime.now().isoformat(), change_desc))
            
            self.db.conn.commit()
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False
    
    def get_all_documents(self) -> List[Dict]:
        """ดึงข้อมูลเอกสารทั้งหมด"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT d.id, d.doc_number, d.title, d.category, d.version, d.status, 
                   u.full_name as owner, d.created_date, d.expiry_date
            FROM documents d
            LEFT JOIN users u ON d.owner_id = u.id
            ORDER BY d.created_date DESC
        ''')
        
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def search_documents(self, keyword: str) -> List[Dict]:
        """ค้นหาเอกสาร"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT d.id, d.doc_number, d.title, d.category, d.version, d.status, 
                   u.full_name as owner
            FROM documents d
            LEFT JOIN users u ON d.owner_id = u.id
            WHERE d.doc_number LIKE ? OR d.title LIKE ? OR d.description LIKE ?
        ''', (f'%{keyword}%', f'%{keyword}%', f'%{keyword}%'))
        
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


class ComplianceManager:
    """จัดการข้อกำหนดการปฏิบัติตาม"""
    
    def __init__(self, db: ISODatabase):
        self.db = db
    
    def create_requirement(self, requirement_code: str, iso_standard: str, 
                          title: str, description: str, category: str,
                          responsible_id: int, due_date: str = None) -> bool:
        """สร้างข้อกำหนดใหม่"""
        try:
            cursor = self.db.conn.cursor()
            cursor.execute('''
                INSERT INTO compliance_requirements 
                (requirement_code, iso_standard, title, description, category, 
                 status, responsible_id, due_date, created_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (requirement_code, iso_standard, title, description, category,
                  'Pending', responsible_id, due_date, datetime.now().isoformat()))
            
            self.db.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def update_requirement_status(self, req_id: int, status: str) -> bool:
        """อัปเดตสถานะข้อกำหนด"""
        try:
            cursor = self.db.conn.cursor()
            completion_date = datetime.now().isoformat() if status == 'Compliant' else None
            cursor.execute('''
                UPDATE compliance_requirements 
                SET status = ?, completion_date = ?
                WHERE id = ?
            ''', (status, completion_date, req_id))
            
            self.db.conn.commit()
            return cursor.rowcount > 0
        except Exception:
            return False
    
    def get_all_requirements(self) -> List[Dict]:
        """ดึงข้อมูลข้อกำหนดทั้งหมด"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT c.id, c.requirement_code, c.iso_standard, c.title, c.category,
                   c.status, u.full_name as responsible, c.due_date, c.completion_date
            FROM compliance_requirements c
            LEFT JOIN users u ON c.responsible_id = u.id
            ORDER BY c.due_date ASC
        ''')
        
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_requirements_by_status(self, status: str) -> List[Dict]:
        """ดึงข้อมูลข้อกำหนดตามสถานะ"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT c.id, c.requirement_code, c.iso_standard, c.title, c.status,
                   u.full_name as responsible, c.due_date
            FROM compliance_requirements c
            LEFT JOIN users u ON c.responsible_id = u.id
            WHERE c.status = ?
            ORDER BY c.due_date ASC
        ''', (status,))
        
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_compliance_summary(self) -> Dict:
        """สรุปสถานะการปฏิบัติตาม"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM compliance_requirements
            GROUP BY status
        ''')
        
        summary = {'Compliant': 0, 'Pending': 0, 'Non-Compliant': 0}
        for row in cursor.fetchall():
            summary[row[0]] = row[1]
        
        cursor.execute('SELECT COUNT(*) FROM compliance_requirements')
        summary['Total'] = cursor.fetchone()[0]
        
        return summary


class AuditManager:
    """จัดการการตรวจประเมิน"""
    
    def __init__(self, db: ISODatabase):
        self.db = db
    
    def create_audit(self, audit_number: str, audit_type: str, iso_standard: str,
                    title: str, scheduled_date: str, auditor_id: int,
                    department: str) -> bool:
        """สร้างการตรวจประเมินใหม่"""
        try:
            cursor = self.db.conn.cursor()
            cursor.execute('''
                INSERT INTO audits 
                (audit_number, audit_type, iso_standard, title, scheduled_date,
                 auditor_id, department, status, created_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (audit_number, audit_type, iso_standard, title, scheduled_date,
                  auditor_id, department, 'Scheduled', datetime.now().isoformat()))
            
            self.db.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def add_finding(self, audit_id: int, finding_number: str, severity: str,
                   description: str, requirement_ref: str, responsible_id: int,
                   due_date: str) -> bool:
        """เพิ่มข้อตรวจพบ"""
        try:
            cursor = self.db.conn.cursor()
            cursor.execute('''
                INSERT INTO audit_findings
                (audit_id, finding_number, severity, description, requirement_reference,
                 responsible_id, due_date, status, created_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (audit_id, finding_number, severity, description, requirement_ref,
                  responsible_id, due_date, 'Open', datetime.now().isoformat()))
            
            # อัปเดตจำนวนข้อตรวจพบ
            cursor.execute('''
                UPDATE audits 
                SET findings_count = (SELECT COUNT(*) FROM audit_findings WHERE audit_id = ?)
                WHERE id = ?
            ''', (audit_id, audit_id))
            
            self.db.conn.commit()
            return True
        except Exception:
            return False
    
    def update_finding_status(self, finding_id: int, status: str, 
                             corrective_action: str = None) -> bool:
        """อัปเดตสถานะข้อตรวจพบ"""
        try:
            cursor = self.db.conn.cursor()
            completion_date = datetime.now().isoformat() if status == 'Closed' else None
            
            if corrective_action:
                cursor.execute('''
                    UPDATE audit_findings 
                    SET status = ?, corrective_action = ?, completion_date = ?
                    WHERE id = ?
                ''', (status, corrective_action, completion_date, finding_id))
            else:
                cursor.execute('''
                    UPDATE audit_findings 
                    SET status = ?, completion_date = ?
                    WHERE id = ?
                ''', (status, completion_date, finding_id))
            
            self.db.conn.commit()
            return cursor.rowcount > 0
        except Exception:
            return False
    
    def get_all_audits(self) -> List[Dict]:
        """ดึงข้อมูลการตรวจประเมินทั้งหมด"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT a.id, a.audit_number, a.audit_type, a.iso_standard, a.title,
                   a.scheduled_date, a.status, u.full_name as auditor, 
                   a.department, a.findings_count
            FROM audits a
            LEFT JOIN users u ON a.auditor_id = u.id
            ORDER BY a.scheduled_date DESC
        ''')
        
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_audit_findings(self, audit_id: int) -> List[Dict]:
        """ดึงข้อตรวจพบของการตรวจประเมิน"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT f.id, f.finding_number, f.severity, f.description,
                   f.requirement_reference, f.status, u.full_name as responsible,
                   f.due_date, f.completion_date, f.corrective_action
            FROM audit_findings f
            LEFT JOIN users u ON f.responsible_id = u.id
            WHERE f.audit_id = ?
            ORDER BY f.severity, f.created_date
        ''', (audit_id,))
        
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_findings_summary(self) -> Dict:
        """สรุปข้อตรวจพบ"""
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT severity, status, COUNT(*) as count
            FROM audit_findings
            GROUP BY severity, status
        ''')
        
        summary = {
            'Critical': {'Open': 0, 'In Progress': 0, 'Closed': 0},
            'Major': {'Open': 0, 'In Progress': 0, 'Closed': 0},
            'Minor': {'Open': 0, 'In Progress': 0, 'Closed': 0},
            'Observation': {'Open': 0, 'In Progress': 0, 'Closed': 0}
        }
        
        for row in cursor.fetchall():
            severity, status, count = row
            if severity in summary and status in summary[severity]:
                summary[severity][status] = count
        
        return summary


class ISOManagementSystem:
    """ระบบจัดการ ISO หลัก"""
    
    def __init__(self):
        self.db = ISODatabase()
        self.doc_manager = DocumentManager(self.db)
        self.compliance_manager = ComplianceManager(self.db)
        self.audit_manager = AuditManager(self.db)
    
    def display_menu(self):
        """แสดงเมนูหลัก"""
        print("\n" + "="*60)
        print("🏢 ระบบจัดการ ISO Management System")
        print("="*60)
        print("1. จัดการเอกสาร (Document Management)")
        print("2. จัดการการปฏิบัติตามข้อกำหนด (Compliance Management)")
        print("3. จัดการการตรวจประเมิน (Audit Management)")
        print("4. รายงานและสถิติ (Reports & Statistics)")
        print("5. จัดการผู้ใช้งาน (User Management)")
        print("0. ออกจากระบบ (Exit)")
        print("="*60)
    
    def document_menu(self):
        """เมนูจัดการเอกสาร"""
        while True:
            print("\n" + "-"*60)
            print("📄 จัดการเอกสาร")
            print("-"*60)
            print("1. แสดงเอกสารทั้งหมด")
            print("2. สร้างเอกสารใหม่")
            print("3. ค้นหาเอกสาร")
            print("4. อัปเดตเอกสาร")
            print("0. กลับเมนูหลัก")
            
            choice = input("\nเลือกเมนู: ").strip()
            
            if choice == '1':
                self.show_all_documents()
            elif choice == '2':
                self.create_new_document()
            elif choice == '3':
                self.search_documents()
            elif choice == '4':
                self.update_document()
            elif choice == '0':
                break
    
    def compliance_menu(self):
        """เมนูจัดการการปฏิบัติตามข้อกำหนด"""
        while True:
            print("\n" + "-"*60)
            print("✅ จัดการการปฏิบัติตามข้อกำหนด")
            print("-"*60)
            print("1. แสดงข้อกำหนดทั้งหมด")
            print("2. สร้างข้อกำหนดใหม่")
            print("3. อัปเดตสถานะข้อกำหนด")
            print("4. แสดงสรุปการปฏิบัติตาม")
            print("5. แสดงข้อกำหนดตามสถานะ")
            print("0. กลับเมนูหลัก")
            
            choice = input("\nเลือกเมนู: ").strip()
            
            if choice == '1':
                self.show_all_requirements()
            elif choice == '2':
                self.create_new_requirement()
            elif choice == '3':
                self.update_requirement_status()
            elif choice == '4':
                self.show_compliance_summary()
            elif choice == '5':
                self.show_requirements_by_status()
            elif choice == '0':
                break
    
    def audit_menu(self):
        """เมนูจัดการการตรวจประเมิน"""
        while True:
            print("\n" + "-"*60)
            print("🔍 จัดการการตรวจประเมิน")
            print("-"*60)
            print("1. แสดงการตรวจประเมินทั้งหมด")
            print("2. สร้างการตรวจประเมินใหม่")
            print("3. เพิ่มข้อตรวจพบ")
            print("4. อัปเดตสถานะข้อตรวจพบ")
            print("5. แสดงข้อตรวจพบของการตรวจประเมิน")
            print("6. สรุปข้อตรวจพบ")
            print("0. กลับเมนูหลัก")
            
            choice = input("\nเลือกเมนู: ").strip()
            
            if choice == '1':
                self.show_all_audits()
            elif choice == '2':
                self.create_new_audit()
            elif choice == '3':
                self.add_audit_finding()
            elif choice == '4':
                self.update_finding_status()
            elif choice == '5':
                self.show_audit_findings()
            elif choice == '6':
                self.show_findings_summary()
            elif choice == '0':
                break
    
    # ฟังก์ชันสำหรับการแสดงผลและการทำงาน
    
    def show_all_documents(self):
        """แสดงเอกสารทั้งหมด"""
        docs = self.doc_manager.get_all_documents()
        if not docs:
            print("\n❌ ไม่มีเอกสารในระบบ")
            return
        
        print(f"\n📋 เอกสารทั้งหมด ({len(docs)} รายการ)")
        print("-"*120)
        print(f"{'ID':<5} {'เลขที่เอกสาร':<15} {'ชื่อเอกสาร':<30} {'หมวดหมู่':<15} {'เวอร์ชัน':<8} {'สถานะ':<12} {'เจ้าของ':<20}")
        print("-"*120)
        
        for doc in docs:
            print(f"{doc['id']:<5} {doc['doc_number']:<15} {doc['title']:<30} "
                  f"{doc['category']:<15} {doc['version']:<8} {doc['status']:<12} {doc['owner']:<20}")
    
    def create_new_document(self):
        """สร้างเอกสารใหม่"""
        print("\n➕ สร้างเอกสารใหม่")
        doc_number = input("เลขที่เอกสาร: ").strip()
        title = input("ชื่อเอกสาร: ").strip()
        description = input("รายละเอียด: ").strip()
        
        print("\nหมวดหมู่: Quality Manual, Procedure, Work Instruction, Form, Record")
        category = input("หมวดหมู่: ").strip()
        
        owner_id = int(input("ID เจ้าของเอกสาร: ").strip())
        
        if self.doc_manager.create_document(doc_number, title, category, owner_id, description):
            print("✅ สร้างเอกสารสำเร็จ")
        else:
            print("❌ ไม่สามารถสร้างเอกสารได้ (เลขที่เอกสารซ้ำ)")
    
    def search_documents(self):
        """ค้นหาเอกสาร"""
        keyword = input("\n🔍 ค้นหา (เลขที่/ชื่อ/รายละเอียด): ").strip()
        docs = self.doc_manager.search_documents(keyword)
        
        if not docs:
            print("\n❌ ไม่พบเอกสารที่ค้นหา")
            return
        
        print(f"\n📋 ผลการค้นหา ({len(docs)} รายการ)")
        print("-"*100)
        print(f"{'ID':<5} {'เลขที่เอกสาร':<15} {'ชื่อเอกสาร':<35} {'หมวดหมู่':<15} {'สถานะ':<12}")
        print("-"*100)
        
        for doc in docs:
            print(f"{doc['id']:<5} {doc['doc_number']:<15} {doc['title']:<35} "
                  f"{doc['category']:<15} {doc['status']:<12}")
    
    def update_document(self):
        """อัปเดตเอกสาร"""
        doc_id = int(input("\n🔄 ID เอกสารที่ต้องการอัปเดต: ").strip())
        user_id = int(input("ID ผู้แก้ไข: ").strip())
        
        print("\nข้อมูลที่ต้องการแก้ไข (เว้นว่างถ้าไม่แก้ไข)")
        title = input("ชื่อเอกสารใหม่: ").strip()
        status = input("สถานะใหม่ (Draft/Review/Approved/Obsolete): ").strip()
        
        updates = {}
        if title:
            updates['title'] = title
        if status:
            updates['status'] = status
        
        if updates and self.doc_manager.update_document(doc_id, user_id, **updates):
            print("✅ อัปเดตเอกสารสำเร็จ")
        else:
            print("❌ ไม่สามารถอัปเดตเอกสารได้")
    
    def show_all_requirements(self):
        """แสดงข้อกำหนดทั้งหมด"""
        reqs = self.compliance_manager.get_all_requirements()
        if not reqs:
            print("\n❌ ไม่มีข้อกำหนดในระบบ")
            return
        
        print(f"\n📋 ข้อกำหนดทั้งหมด ({len(reqs)} รายการ)")
        print("-"*130)
        print(f"{'ID':<5} {'รหัสข้อกำหนด':<15} {'มาตรฐาน':<15} {'ชื่อ':<35} {'สถานะ':<15} {'ผู้รับผิดชอบ':<20}")
        print("-"*130)
        
        for req in reqs:
            print(f"{req['id']:<5} {req['requirement_code']:<15} {req['iso_standard']:<15} "
                  f"{req['title']:<35} {req['status']:<15} {req['responsible'] or 'N/A':<20}")
    
    def create_new_requirement(self):
        """สร้างข้อกำหนดใหม่"""
        print("\n➕ สร้างข้อกำหนดใหม่")
        req_code = input("รหัสข้อกำหนด: ").strip()
        iso_standard = input("มาตรฐาน ISO (เช่น ISO 9001:2015): ").strip()
        title = input("ชื่อข้อกำหนด: ").strip()
        description = input("รายละเอียด: ").strip()
        category = input("หมวดหมู่: ").strip()
        responsible_id = int(input("ID ผู้รับผิดชอบ: ").strip())
        due_date = input("กำหนดเสร็จ (YYYY-MM-DD, เว้นว่างถ้าไม่มี): ").strip() or None
        
        if self.compliance_manager.create_requirement(req_code, iso_standard, title, 
                                                     description, category, responsible_id, due_date):
            print("✅ สร้างข้อกำหนดสำเร็จ")
        else:
            print("❌ ไม่สามารถสร้างข้อกำหนดได้ (รหัสซ้ำ)")
    
    def update_requirement_status(self):
        """อัปเดตสถานะข้อกำหนด"""
        req_id = int(input("\n🔄 ID ข้อกำหนดที่ต้องการอัปเดต: ").strip())
        print("สถานะ: Pending, Compliant, Non-Compliant")
        status = input("สถานะใหม่: ").strip()
        
        if self.compliance_manager.update_requirement_status(req_id, status):
            print("✅ อัปเดตสถานะสำเร็จ")
        else:
            print("❌ ไม่สามารถอัปเดตสถานะได้")
    
    def show_compliance_summary(self):
        """แสดงสรุปการปฏิบัติตาม"""
        summary = self.compliance_manager.get_compliance_summary()
        
        print("\n📊 สรุปการปฏิบัติตามข้อกำหนด")
        print("-"*50)
        print(f"✅ ปฏิบัติตามแล้ว (Compliant):     {summary['Compliant']:>3} รายการ")
        print(f"⏳ อยู่ระหว่างดำเนินการ (Pending):   {summary['Pending']:>3} รายการ")
        print(f"❌ ไม่ปฏิบัติตาม (Non-Compliant):  {summary['Non-Compliant']:>3} รายการ")
        print("-"*50)
        print(f"📋 รวมทั้งหมด:                      {summary['Total']:>3} รายการ")
        
        if summary['Total'] > 0:
            compliance_rate = (summary['Compliant'] / summary['Total']) * 100
            print(f"\n🎯 อัตราการปฏิบัติตาม: {compliance_rate:.1f}%")
    
    def show_requirements_by_status(self):
        """แสดงข้อกำหนดตามสถานะ"""
        print("\nเลือกสถานะ: Pending, Compliant, Non-Compliant")
        status = input("สถานะ: ").strip()
        
        reqs = self.compliance_manager.get_requirements_by_status(status)
        if not reqs:
            print(f"\n❌ ไม่มีข้อกำหนดที่มีสถานะ {status}")
            return
        
        print(f"\n📋 ข้อกำหนดสถานะ {status} ({len(reqs)} รายการ)")
        print("-"*110)
        print(f"{'ID':<5} {'รหัส':<15} {'มาตรฐาน':<15} {'ชื่อ':<35} {'ผู้รับผิดชอบ':<20} {'กำหนดเสร็จ':<15}")
        print("-"*110)
        
        for req in reqs:
            due = req['due_date'][:10] if req['due_date'] else 'N/A'
            print(f"{req['id']:<5} {req['requirement_code']:<15} {req['iso_standard']:<15} "
                  f"{req['title']:<35} {req['responsible'] or 'N/A':<20} {due:<15}")
    
    def show_all_audits(self):
        """แสดงการตรวจประเมินทั้งหมด"""
        audits = self.audit_manager.get_all_audits()
        if not audits:
            print("\n❌ ไม่มีการตรวจประเมินในระบบ")
            return
        
        print(f"\n📋 การตรวจประเมินทั้งหมด ({len(audits)} รายการ)")
        print("-"*130)
        print(f"{'ID':<5} {'เลขที่':<12} {'ประเภท':<15} {'มาตรฐาน':<15} {'ชื่อ':<25} {'วันที่':<12} {'สถานะ':<12} {'ข้อตรวจพบ':<10}")
        print("-"*130)
        
        for audit in audits:
            date = audit['scheduled_date'][:10] if audit['scheduled_date'] else 'N/A'
            print(f"{audit['id']:<5} {audit['audit_number']:<12} {audit['audit_type']:<15} "
                  f"{audit['iso_standard']:<15} {audit['title']:<25} {date:<12} "
                  f"{audit['status']:<12} {audit['findings_count']:<10}")
    
    def create_new_audit(self):
        """สร้างการตรวจประเมินใหม่"""
        print("\n➕ สร้างการตรวจประเมินใหม่")
        audit_number = input("เลขที่การตรวจประเมิน: ").strip()
        
        print("ประเภท: Internal, External, Surveillance, Certification")
        audit_type = input("ประเภท: ").strip()
        
        iso_standard = input("มาตรฐาน ISO: ").strip()
        title = input("ชื่อการตรวจประเมิน: ").strip()
        scheduled_date = input("วันที่กำหนด (YYYY-MM-DD): ").strip()
        auditor_id = int(input("ID ผู้ตรวจประเมิน: ").strip())
        department = input("แผนก/หน่วยงาน: ").strip()
        
        if self.audit_manager.create_audit(audit_number, audit_type, iso_standard, 
                                          title, scheduled_date, auditor_id, department):
            print("✅ สร้างการตรวจประเมินสำเร็จ")
        else:
            print("❌ ไม่สามารถสร้างการตรวจประเมินได้ (เลขที่ซ้ำ)")
    
    def add_audit_finding(self):
        """เพิ่มข้อตรวจพบ"""
        print("\n➕ เพิ่มข้อตรวจพบ")
        audit_id = int(input("ID การตรวจประเมิน: ").strip())
        finding_number = input("เลขที่ข้อตรวจพบ: ").strip()
        
        print("ระดับความรุนแรง: Critical, Major, Minor, Observation")
        severity = input("ระดับความรุนแรง: ").strip()
        
        description = input("รายละเอียดข้อตรวจพบ: ").strip()
        requirement_ref = input("อ้างอิงข้อกำหนด: ").strip()
        responsible_id = int(input("ID ผู้รับผิดชอบ: ").strip())
        due_date = input("กำหนดแก้ไข (YYYY-MM-DD): ").strip()
        
        if self.audit_manager.add_finding(audit_id, finding_number, severity, 
                                         description, requirement_ref, responsible_id, due_date):
            print("✅ เพิ่มข้อตรวจพบสำเร็จ")
        else:
            print("❌ ไม่สามารถเพิ่มข้อตรวจพบได้")
    
    def update_finding_status(self):
        """อัปเดตสถานะข้อตรวจพบ"""
        finding_id = int(input("\n🔄 ID ข้อตรวจพบที่ต้องการอัปเดต: ").strip())
        
        print("สถานะ: Open, In Progress, Closed")
        status = input("สถานะใหม่: ").strip()
        
        corrective_action = None
        if status in ['In Progress', 'Closed']:
            corrective_action = input("มาตรการแก้ไข: ").strip()
        
        if self.audit_manager.update_finding_status(finding_id, status, corrective_action):
            print("✅ อัปเดตสถานะสำเร็จ")
        else:
            print("❌ ไม่สามารถอัปเดตสถานะได้")
    
    def show_audit_findings(self):
        """แสดงข้อตรวจพบของการตรวจประเมิน"""
        audit_id = int(input("\nID การตรวจประเมิน: ").strip())
        findings = self.audit_manager.get_audit_findings(audit_id)
        
        if not findings:
            print("\n❌ ไม่มีข้อตรวจพบ")
            return
        
        print(f"\n📋 ข้อตรวจพบ ({len(findings)} รายการ)")
        print("-"*130)
        print(f"{'ID':<5} {'เลขที่':<12} {'ระดับ':<12} {'รายละเอียด':<40} {'สถานะ':<12} {'กำหนดแก้ไข':<15}")
        print("-"*130)
        
        for finding in findings:
            due = finding['due_date'][:10] if finding['due_date'] else 'N/A'
            desc = finding['description'][:37] + "..." if len(finding['description']) > 40 else finding['description']
            print(f"{finding['id']:<5} {finding['finding_number']:<12} {finding['severity']:<12} "
                  f"{desc:<40} {finding['status']:<12} {due:<15}")
    
    def show_findings_summary(self):
        """สรุปข้อตรวจพบ"""
        summary = self.audit_manager.get_findings_summary()
        
        print("\n📊 สรุปข้อตรวจพบ")
        print("-"*70)
        print(f"{'ระดับความรุนแรง':<20} {'Open':<12} {'In Progress':<15} {'Closed':<12}")
        print("-"*70)
        
        for severity in ['Critical', 'Major', 'Minor', 'Observation']:
            print(f"{severity:<20} {summary[severity]['Open']:<12} "
                  f"{summary[severity]['In Progress']:<15} {summary[severity]['Closed']:<12}")
    
    def run(self):
        """เรียกใช้ระบบ"""
        print("\n🎉 ยินดีต้อนรับสู่ระบบจัดการ ISO Management System")
        print("=" * 60)
        
        while True:
            self.display_menu()
            choice = input("\nเลือกเมนู: ").strip()
            
            if choice == '1':
                self.document_menu()
            elif choice == '2':
                self.compliance_menu()
            elif choice == '3':
                self.audit_menu()
            elif choice == '4':
                self.show_reports()
            elif choice == '5':
                self.user_menu()
            elif choice == '0':
                print("\n👋 ขอบคุณที่ใช้บริการ ระบบจัดการ ISO")
                self.db.close()
                break
            else:
                print("\n❌ กรุณาเลือกเมนูที่ถูกต้อง")
    
    def show_reports(self):
        """แสดงรายงานและสถิติ"""
        print("\n📊 รายงานและสถิติ")
        print("-"*60)
        
        # สรุปการปฏิบัติตาม
        compliance_summary = self.compliance_manager.get_compliance_summary()
        print("\n✅ สรุปการปฏิบัติตามข้อกำหนด")
        print(f"   ปฏิบัติตามแล้ว: {compliance_summary['Compliant']} รายการ")
        print(f"   อยู่ระหว่างดำเนินการ: {compliance_summary['Pending']} รายการ")
        print(f"   ไม่ปฏิบัติตาม: {compliance_summary['Non-Compliant']} รายการ")
        
        if compliance_summary['Total'] > 0:
            rate = (compliance_summary['Compliant'] / compliance_summary['Total']) * 100
            print(f"   อัตราการปฏิบัติตาม: {rate:.1f}%")
        
        # สรุปข้อตรวจพบ
        findings_summary = self.audit_manager.get_findings_summary()
        print("\n🔍 สรุปข้อตรวจพบจากการตรวจประเมิน")
        
        total_open = sum(findings_summary[sev]['Open'] for sev in findings_summary)
        total_closed = sum(findings_summary[sev]['Closed'] for sev in findings_summary)
        total_findings = sum(sum(findings_summary[sev].values()) for sev in findings_summary)
        
        print(f"   ข้อตรวจพบทั้งหมด: {total_findings} รายการ")
        print(f"   ยังไม่ปิด: {total_open} รายการ")
        print(f"   ปิดแล้ว: {total_closed} รายการ")
        
        if total_findings > 0:
            closure_rate = (total_closed / total_findings) * 100
            print(f"   อัตราการปิดข้อตรวจพบ: {closure_rate:.1f}%")
        
        # สรุปเอกสาร
        all_docs = self.doc_manager.get_all_documents()
        print(f"\n📄 เอกสารในระบบ: {len(all_docs)} ฉบับ")
        
        input("\nกด Enter เพื่อกลับเมนูหลัก...")
    
    def user_menu(self):
        """เมนูจัดการผู้ใช้งาน"""
        print("\n👥 จัดการผู้ใช้งาน")
        cursor = self.db.conn.cursor()
        cursor.execute('''
            SELECT id, username, full_name, role, department, email
            FROM users
            WHERE is_active = 1
            ORDER BY id
        ''')
        
        users = cursor.fetchall()
        print("-"*110)
        print(f"{'ID':<5} {'Username':<15} {'ชื่อ-สกุล':<25} {'บทบาท':<15} {'แผนก':<20} {'อีเมล':<25}")
        print("-"*110)
        
        for user in users:
            print(f"{user[0]:<5} {user[1]:<15} {user[2]:<25} {user[3]:<15} "
                  f"{user[4] or 'N/A':<20} {user[5] or 'N/A':<25}")
        
        input("\nกด Enter เพื่อกลับเมนูหลัก...")


def main():
    """ฟังก์ชันหลัก"""
    try:
        system = ISOManagementSystem()
        system.run()
    except KeyboardInterrupt:
        print("\n\n👋 ระบบถูกยกเลิกโดยผู้ใช้")
    except Exception as e:
        print(f"\n❌ เกิดข้อผิดพลาด: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
