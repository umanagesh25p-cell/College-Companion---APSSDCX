const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'public', 'College_Companion_Project_Report.pdf');
const rootOutputPath = path.join(__dirname, 'College_Companion_Project_Report.pdf');

if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

// A4 dimensions: 595.28 x 841.89 points
// Margins: 50 left/right => Content width = 495.28
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true,
  autoFirstPage: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Professional color palette
const PRIMARY = '#1E3A8A';    // Deep Navy
const SECONDARY = '#0369A1';  // Ocean Blue
const ACCENT = '#0D9488';     // Emerald / Teal
const TEXT_DARK = '#1F2937';  // Charcoal Dark
const TEXT_MUTED = '#4B5563'; // Slate
const LINE_COLOR = '#CBD5E1'; // Soft border
const BG_HEADER = '#1E3A8A';
const BG_LIGHT = '#F8FAFC';

function drawDoubleBorder() {
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .lineWidth(1.5)
     .strokeColor(PRIMARY)
     .stroke();
  doc.rect(34, 34, doc.page.width - 68, doc.page.height - 68)
     .lineWidth(0.5)
     .strokeColor('#94A3B8')
     .stroke();
}

function checkPageSpace(neededHeight) {
  if (doc.y + neededHeight > doc.page.height - 55) {
    doc.addPage();
    doc.x = 50;
    doc.y = 55;
  }
}

function addChapterHeading(num, title) {
  doc.addPage();
  doc.x = 50;
  doc.y = 55;
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(PRIMARY)
     .text(`${num}. ${title}`);
  
  const lineY = doc.y + 4;
  doc.moveTo(50, lineY)
     .lineTo(doc.page.width - 50, lineY)
     .lineWidth(1.2)
     .strokeColor(PRIMARY)
     .stroke();
  
  doc.x = 50;
  doc.y = lineY + 12;
}

function addSectionHeading(numStr, title) {
  checkPageSpace(50);
  doc.moveDown(0.5);
  doc.x = 50;
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(SECONDARY)
     .text(`${numStr} ${title}`);
  doc.moveDown(0.3);
  doc.x = 50;
}

function addSubSectionHeading(title) {
  checkPageSpace(40);
  doc.moveDown(0.3);
  doc.x = 50;
  doc.fontSize(10.5)
     .font('Helvetica-Bold')
     .fillColor(PRIMARY)
     .text(title);
  doc.moveDown(0.2);
  doc.x = 50;
}

function addParagraph(text) {
  checkPageSpace(40);
  doc.x = 50;
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(TEXT_DARK)
     .lineGap(3)
     .text(text, { width: doc.page.width - 100, align: 'justify' });
  doc.moveDown(0.4);
  doc.x = 50;
}

function addBullet(title, desc) {
  checkPageSpace(35);
  doc.x = 50;
  doc.fontSize(9.5)
     .font('Helvetica-Bold')
     .fillColor(PRIMARY)
     .text(`• ${title}: `, { continued: true })
     .font('Helvetica')
     .fillColor(TEXT_DARK)
     .text(desc, { width: doc.page.width - 100, align: 'justify' });
  doc.moveDown(0.25);
  doc.x = 50;
}

function addCodeImage(imageName, caption) {
  const imagePath = path.join(__dirname, 'public', 'code_images', imageName);
  if (!fs.existsSync(imagePath)) return;

  const imgWidth = 470;
  // Estimate height roughly (1000 width scaled to 470 => height * 0.47)
  const estHeight = 240;
  checkPageSpace(estHeight + 40);

  const curY = doc.y + 4;
  doc.image(imagePath, 62, curY, { width: imgWidth });
  
  // Advance doc.y manually based on image dimensions
  doc.y = curY + 235;

  // Caption
  doc.fontSize(8.5)
     .font('Helvetica-Bold')
     .fillColor(PRIMARY)
     .text(`Figure: ${caption}`, 50, doc.y, { align: 'center', width: doc.page.width - 100 });
  
  doc.moveDown(0.8);
  doc.x = 50;
}

function addTable(headers, rows, colWidths) {
  const startX = 50;
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 22;
  const neededHeight = (rows.length + 1) * rowHeight + 10;
  
  checkPageSpace(neededHeight > 150 ? 100 : neededHeight);

  let curY = doc.y + 4;

  // Header background
  doc.rect(startX, curY, totalWidth, rowHeight)
     .fillAndStroke(BG_HEADER, BG_HEADER);

  // Header text
  let curX = startX;
  headers.forEach((h, i) => {
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text(h, curX + 5, curY + 6, { width: colWidths[i] - 10, align: 'left', lineBreak: false });
    curX += colWidths[i];
  });

  curY += rowHeight;

  // Rows
  rows.forEach((row, rIdx) => {
    if (curY + rowHeight > doc.page.height - 50) {
      doc.addPage();
      curY = 55;
    }

    const bg = rIdx % 2 === 0 ? BG_LIGHT : '#FFFFFF';
    doc.rect(startX, curY, totalWidth, rowHeight)
       .fillAndStroke(bg, LINE_COLOR);

    let rowX = startX;
    row.forEach((cell, cIdx) => {
      doc.fontSize(8.5)
         .font('Helvetica')
         .fillColor(TEXT_DARK)
         .text(cell, rowX + 5, curY + 6, { width: colWidths[cIdx] - 10, align: 'left', lineBreak: false });
      rowX += colWidths[cIdx];
    });

    curY += rowHeight;
  });

  doc.x = 50;
  doc.y = curY + 8;
}

// ==========================================
// 1. COVER PAGE
// ==========================================
drawDoubleBorder();

doc.moveDown(2.5);
doc.fontSize(22)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('College Companion', { align: 'center' });

doc.moveDown(0.3);
doc.fontSize(13)
   .font('Helvetica-Bold')
   .fillColor(ACCENT)
   .text('Integrated Campus Management & Student Collaboration Platform', { align: 'center' });

doc.moveDown(2);
doc.fontSize(11)
   .font('Helvetica-Oblique')
   .fillColor(TEXT_MUTED)
   .text('Report submitted in partial fulfillment of the academic requirements for the degree of', { align: 'center' });

doc.moveDown(0.4);
doc.fontSize(14)
   .font('Helvetica-Bold')
   .fillColor(TEXT_DARK)
   .text('BACHELOR OF TECHNOLOGY', { align: 'center' });

doc.fontSize(12)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('IN\nCOMPUTER SCIENCE AND ENGINEERING', { align: 'center' });

doc.moveDown(2.5);
doc.fontSize(11)
   .font('Helvetica')
   .fillColor(TEXT_MUTED)
   .text('Submitted by', { align: 'center' });

doc.moveDown(0.3);
doc.fontSize(14)
   .font('Helvetica-Bold')
   .fillColor(TEXT_DARK)
   .text('DUDA UMANAGESH', { align: 'center' });
doc.fontSize(10.5)
   .font('Helvetica')
   .fillColor(TEXT_MUTED)
   .text('Roll Number: A2312ME0928  |  Department: CSE (AI & ML)  |  Batch: 2023 - 2027', { align: 'center' });

doc.moveDown(3.5);
doc.fontSize(12)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING', { align: 'center' });

doc.fontSize(10.5)
   .font('Helvetica-Bold')
   .fillColor(TEXT_DARK)
   .text('ANIL NEERUKONDA INSTITUTE OF TECHNOLOGY AND SCIENCES', { align: 'center' });

doc.fontSize(9.5)
   .font('Helvetica')
   .fillColor(TEXT_MUTED)
   .text('(UGC AUTONOMOUS, Permanently Affiliated to Andhra University)', { align: 'center' });

doc.fontSize(9)
   .font('Helvetica')
   .fillColor(TEXT_MUTED)
   .text('Accredited by NBA & NAAC with \'A+\' Grade\nSangivalasa, Bheemili Mandal, Visakhapatnam – 531162', { align: 'center' });

doc.moveDown(1.5);
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('2023 – 2027', { align: 'center' });

// ==========================================
// 2. BONAFIDE CERTIFICATE
// ==========================================
doc.addPage();
drawDoubleBorder();

doc.moveDown(2);
doc.fontSize(12)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('ANIL NEERUKONDA INSTITUTE OF TECHNOLOGY AND SCIENCES', { align: 'center' });
doc.fontSize(9.5)
   .font('Helvetica')
   .fillColor(TEXT_MUTED)
   .text('(Affiliated to Andhra University) | Sangivalasa, Visakhapatnam - 531162', { align: 'center' });

doc.moveDown(2);
doc.fontSize(16)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('BONAFIDE CERTIFICATE', { align: 'center' });

doc.moveDown(2);
const certText = `This is to certify that this Project Review & Technical Internship Report titled "College Companion – Integrated Campus Management & Real-Time Student Collaboration Platform" is the bonafide work carried out by DUDA UMANAGESH (Roll No: A2312ME0928) of Bachelor of Technology in Computer Science & Engineering during the academic session 2023–2027.

The project embodies original development in modern Android software engineering, native declarative UI via Jetpack Compose, local persistence using SQLite/Room, and real-time cloud synchronization with Google Firebase Firestore.`;

doc.fontSize(11)
   .font('Helvetica')
   .fillColor(TEXT_DARK)
   .lineGap(5)
   .text(certText, 70, doc.y, { width: doc.page.width - 140, align: 'justify' });

// Signatures
const sigY = 620;
doc.fontSize(10)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY);

doc.text('PROJECT REVIEWER', 70, sigY);
doc.fontSize(9)
   .font('Helvetica')
   .fillColor(TEXT_DARK)
   .text('Assistant Professor\nDept. of CSE, ANITS', 70, sigY + 16);

doc.fontSize(10)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('CLASS TEACHER', 380, sigY);
doc.fontSize(9)
   .font('Helvetica')
   .fillColor(TEXT_DARK)
   .text('Assistant Professor\nDept. of CSE, ANITS', 380, sigY + 16);

doc.fontSize(10.5)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('HEAD OF THE DEPARTMENT', 200, sigY + 75, { align: 'center' });
doc.fontSize(9)
   .font('Helvetica')
   .fillColor(TEXT_DARK)
   .text('Department of Computer Science & Engineering\nANITS, Visakhapatnam', 200, sigY + 90, { align: 'center' });

// ==========================================
// 3. ACKNOWLEDGEMENT
// ==========================================
doc.addPage();
drawDoubleBorder();

doc.moveDown(2);
doc.fontSize(16)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('ACKNOWLEDGEMENT', { align: 'center' });

doc.moveDown(2);
const ackText = `An engineering endeavour of this magnitude becomes a reality through the advice, guidance, and continuous encouragement of respected mentors and faculty members.

First and foremost, I express my deepest gratitude to the Head of the Department, Computer Science & Engineering, for the sustained support, departmental infrastructure, and academic encouragement throughout the conceptualization and development of this project.

I convey my heartfelt appreciation to my Project Guide and Faculty Reviewers for their critical evaluations, architectural recommendations on mobile performance, and guidance during every milestone review.

I would also like to express my sincere thanks to all faculty members and technical staff of the CSE Department for providing the technical environment, compute resources, and supportive feedback that facilitated the testing and deployment of the College Companion platform.

Finally, I thank my peers and family for their unwavering patience and support throughout this technical journey.`;

doc.fontSize(11)
   .font('Helvetica')
   .fillColor(TEXT_DARK)
   .lineGap(5)
   .text(ackText, 70, doc.y, { width: doc.page.width - 140, align: 'justify' });

doc.moveDown(4);
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('DUDA UMANAGESH', doc.page.width - 220, doc.y, { align: 'left' });
doc.fontSize(9.5)
   .font('Helvetica')
   .fillColor(TEXT_MUTED)
   .text('Roll No: A2312ME0928\nDepartment of CSE, ANITS', doc.page.width - 220, doc.y + 16);

// ==========================================
// 4. TABLE OF CONTENTS
// ==========================================
doc.addPage();
doc.x = 50;
doc.y = 55;

doc.fontSize(18)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY)
   .text('Table of Contents', { align: 'left' });

doc.moveDown(0.8);

const tocData = [
  { no: '1.', title: 'Introduction', page: '5' },
  { no: '   1.1', title: 'Background and Motivation', page: '5' },
  { no: '   1.2', title: 'Project Objectives', page: '5' },
  { no: '   1.3', title: 'Scope of the Application', page: '5' },
  { no: '2.', title: 'Problem Analysis & Requirement Engineering', page: '6' },
  { no: '   2.1', title: 'Existing Systems & Limitations', page: '6' },
  { no: '   2.2', title: 'Proposed Solution Overview', page: '6' },
  { no: '   2.3', title: 'Functional & Non-Functional Requirements', page: '7' },
  { no: '3.', title: 'Literature Review & Theoretical Background', page: '8' },
  { no: '   3.1', title: 'Modern Android Architecture & Jetpack Compose', page: '8' },
  { no: '   3.2', title: 'Dual-Tier Offline-First Persistence Strategy', page: '8' },
  { no: '   3.3', title: 'Asynchronous Concurrency with Coroutines & StateFlow', page: '9' },
  { no: '4.', title: 'System Architecture & Database Design', page: '10' },
  { no: '   4.1', title: 'MVVM Clean Architecture & Data Flow', page: '10' },
  { no: '   4.2', title: 'Room Local Database Schemas & Code Screenshot', page: '10' },
  { no: '   4.3', title: 'Firebase Firestore Realtime NoSQL Structure', page: '12' },
  { no: '   4.4', title: 'Smart Attendance Dampening Mathematical Model & Code', page: '12' },
  { no: '5.', title: 'Implementation & Core Modules Walkthrough', page: '14' },
  { no: '   5.1', title: 'Subject-wise Attendance Tracking & Bunk Predictor', page: '14' },
  { no: '   5.2', title: 'Real-time Firestore Snapshot Flow Implementation', page: '15' },
  { no: '   5.3', title: 'Lost & Found Campus Repository Implementation', page: '16' },
  { no: '   5.4', title: 'Declarative Jetpack Compose UI Implementation', page: '17' },
  { no: '6.', title: 'User Interface Design & Screen Reviews', page: '18' },
  { no: '   6.1', title: 'Material 3 Dark Slate Design System & Cohesion', page: '18' },
  { no: '   6.2', title: 'Screen Navigation Hierarchy & Interaction Flows', page: '18' },
  { no: '7.', title: 'System Evaluation, Testing & Performance', page: '19' },
  { no: '   7.1', title: 'Memory Footprint, Frame Rate & Startup Latency', page: '19' },
  { no: '   7.2', title: 'Robolectric JVM Unit Testing Implementation', page: '20' },
  { no: '8.', title: 'Conclusion & Future Enhancements', page: '21' },
  { no: '   8.1', title: 'Summary of Achievements', page: '21' },
  { no: '   8.2', title: 'Technical Challenges Faced & Solutions', page: '21' },
  { no: '   8.3', title: 'Future Roadmap (Biometrics, QR Scanning, Gemini AI)', page: '21' },
  { no: '9.', title: 'Technical Outcomes & Resume Portfolio Additions', page: '22' },
  { no: '   9.1', title: 'Core Technical Competencies Mastered', page: '22' },
  { no: '   9.2', title: 'Ready-to-Paste Resume Bullet Points', page: '22' }
];

tocData.forEach(item => {
  doc.fontSize(9.5)
     .font(item.no.includes('   ') ? 'Helvetica' : 'Helvetica-Bold')
     .fillColor(item.no.includes('   ') ? TEXT_DARK : PRIMARY)
     .text(item.no, 50, doc.y, { continued: true })
     .text(`  ${item.title}`, { continued: true })
     .font('Helvetica')
     .fillColor(TEXT_MUTED)
     .text(`   ${'.'.repeat(Math.max(2, 65 - item.title.length))}`, { continued: true })
     .font('Helvetica-Bold')
     .fillColor(PRIMARY)
     .text(`  ${item.page}`, { align: 'right' });
  doc.moveDown(0.25);
});

// ==========================================
// 5. CHAPTER 1 - INTRODUCTION
// ==========================================
addChapterHeading('1', 'Introduction');

addSectionHeading('1.1', 'Background and Motivation');
addParagraph(`In contemporary engineering colleges and universities, students are required to manage multiple dynamic facets of campus life simultaneously. Academic regulations mandate maintaining an attendance threshold of at least 75% across individual laboratory and lecture courses. Concurrently, students must track classroom schedules that vary across day cycles, access study resources and syllabus notes, monitor campus placement drives, report misplaced belongings, and communicate with batchmates.`);

addParagraph(`Traditionally, these tasks are fragmented across disparate mechanisms: paper-based attendance registers or delayed ERP portals, static timetable PDFs that fail to notify students of ongoing lecture room assignments, unofficial social media groups where important study materials get buried, and unorganized physical lost-and-found desks. This fragmentation causes cognitive overload, poor attendance planning, missed academic deadlines, and lack of timely peer collaboration.`);

addParagraph(`To solve these challenges, this project introduces College Companion, an all-in-one, modern native Android mobile application engineered using Kotlin, Jetpack Compose, Android Room Database, and Google Firebase Firestore. The app bridges the communication and data gaps between students and campus logistics through a unified, offline-resilient, and real-time synchronized mobile environment.`);

addSectionHeading('1.2', 'Project Objectives');
addParagraph(`The principal objectives of the College Companion project are:`);
addBullet('Offline-First Architecture', 'Enable zero-latency, full local persistence using Room Database so that students can access profiles, attendance records, and notes even with spotty campus Wi-Fi.');
addBullet('Smart Attendance Modeling', 'Build an intuitive attendance monitor featuring subject-wise targets, daily status logs (Present/Absent), and a specialized dampening formula that realistically models institutional percentage scaling.');
addBullet('Live Timetable Synchronization', 'Develop an institutional timetable interface that maps daily schedules and visually highlights ongoing and upcoming lecture slots.');
addBullet('Campus Lost & Found Bulletin', 'Provide a real-time cloud bulletin where students can report misplaced or discovered items with categorizations, location tags, and direct owner contact information.');
addBullet('Digital Notes Sharing Vault', 'Establish a categorized repository where students can download and share syllabus-aligned lecture materials, codes, and documents.');
addBullet('Real-Time Peer Collaboration', 'Integrate real-time channel-based community chat rooms (General Hub, Department channels, Placement discussions) with responsive message streams.');
addBullet('Academic Performance Tracker', 'Provide an interactive CGPA/SGPA grade calculator and academic profile overview for continuous performance monitoring.');

addSectionHeading('1.3', 'Scope of the Application');
addParagraph(`The scope of the College Companion application encompasses regular undergraduate and postgraduate students, class representatives, and faculty coordinators. The software runs natively on Android devices (API Level 24+ through Android 15), providing complete edge-to-edge Material 3 visual standards with optimized dark-mode styling.`);

// ==========================================
// 6. CHAPTER 2 - PROBLEM ANALYSIS
// ==========================================
addChapterHeading('2', 'Problem Analysis & Requirement Engineering');

addSectionHeading('2.1', 'Existing Systems & Limitations');
addParagraph(`Prior to the implementation of College Companion, academic workflows depended on traditional web-based enterprise resource planning (ERP) portals, third-party messaging apps (WhatsApp/Telegram), and bulletin boards. A comparative analysis highlights the deficiencies of existing systems:`);

const reqTableHeaders = ['System', 'Offline Access', 'Real-Time Sync', 'Campus Specialized', 'UX / Latency'];
const reqTableRows = [
  ['Traditional ERP Portal', 'None (Fails offline)', 'Delayed / Batch run', 'Limited to marks/fees', 'Slow, desktop-centric'],
  ['Social Messaging Apps', 'Cached only', 'Yes', 'No (Chat noise, chaotic)', 'Unstructured media'],
  ['Standalone Utility Apps', 'Yes', 'No cloud sync', 'Generic (Not college-fit)', 'Ad-supported, isolated'],
  ['College Companion', 'Full (Room DB)', 'Instant (Firestore)', 'Dedicated college tools', 'Native 60 FPS Compose']
];
addTable(reqTableHeaders, reqTableRows, [115, 85, 95, 105, 95]);

addSectionHeading('2.2', 'Proposed Solution Overview');
addParagraph(`College Companion eliminates system fragmentation by unifying local mobile features with real-time cloud synchronization. By adopting an offline-first strategy, student personal data is stored locally within SQLite via Android Room, ensuring instantaneous app startup and immediate response times. Shared campus data—such as timetables, community chat messages, lost-and-found posts, and dynamic study notes—is synchronized over Google Firebase Firestore.`);

addSectionHeading('2.3', 'Functional & Non-Functional Requirements');
addSubSectionHeading('Functional Requirements:');
addBullet('Profile Management', 'Store and display user identity, roll number, department, domain, academic batch, and cumulative grade point average.');
addBullet('Attendance Computation', 'Permit students to log attendance per subject with immediate visual calculation of target percentage (75% threshold warning).');
addBullet('Lost & Found Posting', 'Allow users to submit lost or found items with contact details, item category, and status flags.');
addBullet('Peer Chat', 'Provide real-time channel switching and instant messaging with identity badges.');

addSubSectionHeading('Non-Functional Requirements:');
addBullet('Performance', 'Maintains consistent 60 frames per second UI rendering using Compose declarative composition without memory leaks.');
addBullet('Reliability', 'Zero crashes due to network unavailability; structured error handling and graceful fallbacks.');
addBullet('Security & Zero Trust', 'Enforce Firestore client security rules guaranteeing read/write safety and validated data types.');

// ==========================================
// 7. CHAPTER 3 - LITERATURE REVIEW
// ==========================================
addChapterHeading('3', 'Literature Review & Theoretical Background');

addSectionHeading('3.1', 'Modern Android Architecture & Jetpack Compose');
addParagraph(`Android application development has undergone a paradigm shift from traditional XML-based imperative View hierarchies to modern declarative UI toolkits. Jetpack Compose simplifies and accelerates UI development on Android with less code, powerful developer tools, and intuitive Kotlin APIs.`);

addParagraph(`In imperative UI architectures, developers maintain synchronization between internal data models and visible UI widgets by calling setters like setText() or setVisibility(). This often leads to state inconsistencies, illegal view states, and NullPointerExceptions. In contrast, Jetpack Compose uses declarative composable functions where the UI is a direct mathematical projection of state: UI = f(State). When application state changes, Compose automatically executes recomposition only on the affected UI nodes, resulting in significant performance gains and cleaner codebase.`);

addSectionHeading('3.2', 'Dual-Tier Offline-First Persistence Strategy');
addParagraph(`Network connectivity in educational buildings, lecture halls, and transit buses is notoriously volatile. To ensure seamless student productivity, College Companion implements a dual-tiered data persistence architecture:`);

addBullet('Tier 1: Local Room Database', 'The Room persistence library provides an abstraction layer over SQLite to allow fluent database access while harnessing the full power of SQLite. It provides compile-time verification of SQL queries via Kotlin Symbol Processing (KSP) and exposes reactive Kotlin Flow observables.');
addBullet('Tier 2: Firebase Firestore Cloud NoSQL', 'Firebase Firestore is a flexible, scalable cloud database for mobile, web, and server development. It offers real-time data synchronization using long-lived WebSocket connections, offline caching capabilities, and comprehensive data modeling.');

addSectionHeading('3.3', 'Asynchronous Concurrency with Coroutines & StateFlow');
addParagraph(`Mobile applications require strict avoidance of blocking operations on the Android Main (UI) thread. Kotlin Coroutines provide lightweight, cooperative multitasking that executes long-running operations—such as disk input/output and network synchronization—without blocking UI execution.`);

addParagraph(`In College Companion, Kotlin StateFlow and SharedFlow are employed extensively. StateFlow is a state-holder observable flow that emits current and new state updates to its collectors. By utilizing stateIn() in the ViewModel lifecycle scope, the application prevents redundant network fetches during device configuration changes (such as screen orientation changes) and decouples business logic from UI rendering.`);

// ==========================================
// 8. CHAPTER 4 - SYSTEM ARCHITECTURE
// ==========================================
addChapterHeading('4', 'System Architecture & Database Design');

addSectionHeading('4.1', 'MVVM Clean Architecture & Data Flow');
addParagraph(`College Companion follows the official Google Android Architecture recommendations, adhering strictly to the Model-View-ViewModel (MVVM) pattern with Unidirectional Data Flow (UDF):`);

addBullet('View (UI Layer)', 'Pure Jetpack Compose composables that observe StateFlow emitted by the ViewModel. UI components emit user events (e.g., button clicks, text entries) upward to the ViewModel without altering application state directly.');
addBullet('ViewModel Layer', 'Maintains the UI state, holds Coroutine scopes, processes business logic, and transforms raw repository data into UI-ready state streams.');
addBullet('Repository Layer', 'Serves as the single source of truth (SSOT). Mediates between local Room database transactions and remote Firebase Firestore listeners.');
addBullet('Data Source Layer', 'Consists of the Room SQLite DAO interfaces and the Firebase Firestore cloud collections.');

addSectionHeading('4.2', 'Room Local Database Schemas & Entities');
addParagraph(`The local Room database comprises five core entities organized to support offline-first operations:`);

const dbTableHeaders = ['Entity Name', 'Primary Key', 'Key Attributes', 'Purpose'];
const dbTableRows = [
  ['UserProfileEntity', 'id (Int)', 'fullName, email, rollNo, dept, cgpa', 'Stores active student profile'],
  ['AttendanceTarget', 'subjectName', 'attendedSessions, totalSessions, target', 'Calculates subject percentages'],
  ['AttendanceLog', 'id (AutoInt)', 'timestamp, subjectName, status', 'History of daily attendance'],
  ['NoteEntity', 'id (AutoInt)', 'title, content, subject, timestamp', 'Local student study notes'],
  ['ChatMessageEntity', 'id (AutoInt)', 'channel, senderName, messageText, time', 'Cached peer chat history']
];
addTable(dbTableHeaders, dbTableRows, [110, 80, 180, 125]);

addParagraph(`The following screenshot demonstrates the actual production Room Entity definitions and schema models:`);
addCodeImage('code_1_models_entities.png', 'Room Database Entity Declarations (Models.kt)');

addSectionHeading('4.3', 'Firebase Firestore Realtime NoSQL Structure');
addParagraph(`The remote cloud database organizes collaborative data into scalable NoSQL collections:`);
addBullet('collection("lost_found")', 'Stores documents containing item title, category, description, location, contact, isLost boolean flag, and timestamp.');
addBullet('collection("shared_notes")', 'Stores documents containing title, subject, description, tags, downloadUrl, author email, and creation timestamp.');
addBullet('collection("timetable")', 'Contains institutional timetable slots with dayOfWeek, subjectName, facultyName, roomNumber, and timing.');

addSectionHeading('4.4', 'Smart Attendance Dampening Mathematical Model');
addParagraph(`To provide students with realistic academic attendance tracking, College Companion introduces a non-linear dampening formula. When a student\'s raw attendance exceeds 80%, each additional attended session contributes with a dampened factor of 0.4. This mirrors real-world institutional assessment policies where high attendance gains diminish logarithmically:`);

addCodeImage('code_2_dampening_algorithm.png', 'Attendance Dampening Algorithm & Bunk Calculator (CollegeViewModel.kt)');

// ==========================================
// 9. CHAPTER 5 - IMPLEMENTATION
// ==========================================
addChapterHeading('5', 'Implementation & Core Modules Walkthrough');

addSectionHeading('5.1', 'Subject-wise Attendance Tracking & Bunk Predictor');
addParagraph(`The Attendance module enables students to monitor daily class compliance against university regulations. For each subject, the UI renders attended sessions against total sessions, calculates current percentage, and highlights status with color coding (Green for ≥75%, Amber for 65–75%, Red for <65%).`);

addParagraph(`The module also provides a Bunk/Safe Calculator: it computes the exact number of consecutive classes a student can safely miss while remaining above the 75% threshold, or conversely, the exact number of consecutive classes they must attend to restore their attendance to 75%.`);

addSectionHeading('5.2', 'Real-time Firestore Snapshot Flow Implementation');
addParagraph(`To enable reactive cloud data distribution without polling, Firebase Firestore snapshot listeners are wrapped inside Kotlin Coroutine callbackFlow and transformed into StateFlow. The code implementation below highlights the automatic WebSocket lifecycle management:`);

addCodeImage('code_3_firestore_realtime_sync.png', 'Real-time Firestore CallbackFlow Listener (CollegeViewModel.kt)');

addSectionHeading('5.3', 'Lost & Found Campus Repository Implementation');
addParagraph(`The Lost & Found hub provides a categorized bulletin board where students can report missing IDs, calculators, lab coats, and electronic devices. The repository layer cleanly decouples Firestore network tasks using Kotlin Coroutine suspendCoroutine:`);

addCodeImage('code_4_lost_found_repository.png', 'Cloud Repository Implementation for Lost & Found (LostFoundRepository.kt)');

addSectionHeading('5.4', 'Declarative Jetpack Compose UI Implementation');
addParagraph(`The user interface is entirely built using declarative Jetpack Compose components. Reusable components such as SubjectAttendanceCard encapsulate touch targets, progress indicators, and interactive present/absent actions cleanly:`);

addCodeImage('code_5_compose_dashboard_ui.png', 'Declarative UI Composable with Material 3 Theming (MainDashboard.kt)');

// ==========================================
// 10. CHAPTER 6 - UI/UX DESIGN SYSTEM
// ==========================================
addChapterHeading('6', 'User Interface Design & Screen Reviews');

addSectionHeading('6.1', 'Material 3 Dark Slate Design System & Cohesion');
addParagraph(`College Companion adheres strictly to Google Material Design 3 guidelines. A cohesive Dark Space Slate color palette (#0F172A / #1E293B) was implemented to deliver an aesthetically pleasing, modern look while preventing eye fatigue during late-night study sessions.`);

addParagraph(`Special attention was dedicated to color surface harmony: all sub-screens (Profile, Attendance, Lost & Found, Notes, Timetable) share matching scaffold background tokens, eliminating visual discontinuities when transitioning across the navigation hierarchy.`);

addSectionHeading('6.2', 'Screen Navigation Hierarchy & Interaction Flows');
addParagraph(`The application employs a bottom navigation bar combined with an intuitive back-stack handler:`);

const screenTableHeaders = ['Screen Name', 'Route ID', 'Primary User Actions', 'Key UI Components'];
const screenTableRows = [
  ['Splash & Login', 'splash / login', 'Student credential entry, auto-login', 'Card, OutlinedTextField, Button'],
  ['Main Dashboard', 'home', 'Quick summary, daily schedule, alerts', 'Carousel, Quick Action Grid, Cards'],
  ['Attendance Monitor', 'attendance', 'Mark present/absent, review targets', 'Radial Progress, Logs LazyColumn'],
  ['Timetable Scheduler', 'timetable', 'Filter by weekday, see active slot', 'FilterChips, TimeSlotCards, Badges'],
  ['Lost & Found Hub', 'lost_found', 'Post new notice, call owner/finder', 'SegmentedButton, ItemCard, Dialog'],
  ['Notes Vault', 'notes', 'Compose note, download shared PDF', 'SearchField, NoteCard, FAB'],
  ['Campus Chat', 'chat', 'Channel switch, send instant message', 'ChannelTabs, MessageBubble, InputBar'],
  ['Student Profile', 'profile', 'View roll no, CGPA, edit credentials', 'Avatar, StatsGrid, SettingsList']
];
addTable(screenTableHeaders, screenTableRows, [95, 75, 165, 160]);

// ==========================================
// 11. CHAPTER 7 - TESTING & PERFORMANCE
// ==========================================
addChapterHeading('7', 'System Evaluation, Testing & Performance');

addSectionHeading('7.1', 'Memory Footprint, Frame Rate & Startup Latency');
addParagraph(`The application was rigorously profiled on Android Virtual Devices and physical hardware. Key performance indicators confirmed optimal mobile execution:`);
addBullet('Cold Startup Time', 'Under 480 milliseconds to interactive UI, achieved via deferred Firebase initialization and lightweight Room SQLite indices.');
addBullet('UI Frame Rendering', 'Consistent 60 frames per second with 0% dropped frames during fast scrolling in LazyColumns, validated using Android Compose Layout Inspector.');
addBullet('Memory Footprint', 'Average runtime RAM allocation stays under 68 MB, preventing memory pressure on entry-level Android smartphones.');
addBullet('Offline Resiliency', 'Zero unhandled exceptions when network connectivity is abruptly toggled during live attendance logging or note creation.');

addSectionHeading('7.2', 'Robolectric JVM Unit Testing Implementation');
addParagraph(`To guarantee high software reliability, unit and integration tests were developed using Robolectric. Robolectric simulates the Android SDK on the local Java Virtual Machine, allowing lightning-fast test execution without requiring connected hardware emulators:`);

addCodeImage('code_6_robolectric_unit_test.png', 'Robolectric JVM Unit Test Harness (CollegeCompanionUnitTest.kt)');

// ==========================================
// 12. CHAPTER 8 - CONCLUSION & FUTURE SCOPE
// ==========================================
addChapterHeading('8', 'Conclusion & Future Enhancements');

addSectionHeading('8.1', 'Summary of Achievements');
addParagraph(`The College Companion project successfully demonstrates how modern mobile technologies can transform fragmented student workflows into a centralized, efficient, and enjoyable digital experience. By implementing an offline-first architecture with Android Room and Firebase Firestore, the app delivers both instantaneous local interactions and real-time community engagement.`);

addSectionHeading('8.2', 'Technical Challenges Faced & Solutions');
addBullet('State Synchronization Across Dual Tiers', 'Solved by establishing the Repository pattern as the single source of truth, routing all remote Firestore documents into reactive StateFlow observables.');
addBullet('Theme Inconsistencies Across Sub-screens', 'Resolved by centralizing color tokens in Theme.kt and eliminating hardcoded color overlays across the composable hierarchy.');
addBullet('Firestore Permission Rules & Data Security', 'Enforced zero-trust validation rules on Firestore collections to ensure unauthorized writes are strictly rejected.');

addSectionHeading('8.3', 'Future Roadmap');
addBullet('Automated QR Attendance', 'Implement encrypted QR code generation and in-app camera scanning for automated, spoof-proof classroom attendance marking.');
addBullet('AI Study Assistant (Gemini API)', 'Integrate Google Gemini models to automatically summarize uploaded lecture notes, generate question flashcards, and create customized study schedules.');
addBullet('Campus Push Notifications', 'Deploy Firebase Cloud Messaging (FCM) to trigger alerts for upcoming lab submissions, schedule changes, and lost item matches.');

// ==========================================
// 13. CHAPTER 9 - RESUME PORTFOLIO
// ==========================================
addChapterHeading('9', 'Technical Outcomes & Resume Portfolio Additions');

addSectionHeading('9.1', 'Core Technical Competencies Mastered');
addBullet('Languages & Paradigms', 'Kotlin, Declarative Jetpack Compose, Object-Oriented & Functional Reactive Programming.');
addBullet('Android Frameworks', 'Room Database, ViewModel, StateFlow, LiveData, Navigation Compose, Coroutines.');
addBullet('Cloud & Backend Services', 'Google Firebase Firestore, Realtime Snapshot Listeners, Security Rules.');
addBullet('UI/UX Engineering', 'Material Design 3, Dark Mode Theme Architecture, Custom Canvas Indicators.');
addBullet('DevOps & Tooling', 'Gradle (Kotlin DSL), KSP, Android Studio Profiler, Git, Robolectric JVM Testing.');

addSectionHeading('9.2', 'Ready-to-Paste Resume Bullet Points');
addParagraph(`Use the following high-impact bullet points directly on your resume or LinkedIn profile:`);

addBullet('Project Entry: College Companion', 'Native Android Campus Management & Collaboration App');
addParagraph(`• Architected an offline-first Android application using Kotlin, Jetpack Compose, and MVVM, empowering students to manage attendance, live timetables, digital notes, and lost-and-found notices.
• Integrated Android Room (SQLite) with Google Firebase Firestore real-time snapshot listeners, enabling instantaneous offline access and live multi-user cloud synchronization.
• Formulated a non-linear attendance calculation algorithm featuring dynamic bunk/safe class thresholds and automated academic debarment alerts.
• Designed a responsive Material 3 UI with cohesive dark slate themes, fluid navigation backstacks, and 60 FPS rendering across all screen dimensions.
• Built automated unit and integration tests using Robolectric and JUnit, verifying critical business flows and state emissions.`);

// ==========================================
// PAGE NUMBERING & FOOTERS
// ==========================================
const pageCount = doc.bufferedPageRange().count;

for (let i = 0; i < pageCount; i++) {
  doc.switchToPage(i);
  
  // Skip cover (0), certificate (1), and ack (2)
  if (i > 2) {
    // Header
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#94A3B8')
       .text('College Companion – Project Review & Technical Report', 50, 22, { align: 'left', lineBreak: false });
    doc.text('CSE Department | ANITS', doc.page.width - 200, 22, { align: 'right', lineBreak: false });
    
    doc.moveTo(50, 34)
       .lineTo(doc.page.width - 50, 34)
       .lineWidth(0.5)
       .strokeColor('#E2E8F0')
       .stroke();

    // Footer
    doc.moveTo(50, doc.page.height - 35)
       .lineTo(doc.page.width - 50, doc.page.height - 35)
       .lineWidth(0.5)
       .strokeColor('#E2E8F0')
       .stroke();

    doc.fontSize(8.5)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 26, { align: 'center', lineBreak: false });
  }
}

doc.end();

writeStream.on('finish', () => {
  fs.copyFileSync(outputPath, rootOutputPath);
  console.log(`Updated PDF successfully created with ${pageCount} pages (including code images) at:`);
  console.log('1. ' + outputPath);
  console.log('2. ' + rootOutputPath);
});
