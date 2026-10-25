const PImage = require('pureimage');
const fs = require('fs');
const path = require('path');

const fontRegular = PImage.registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 'DejaVuSansMono');
fontRegular.loadSync();
const fontBold = PImage.registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 'DejaVuSansMono-Bold');
fontBold.loadSync();

const outputDir = path.join(__dirname, 'public', 'code_images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Token types and colors
const COLORS = {
  bg: '#181825',
  headerBg: '#11111B',
  border: '#313244',
  lineNo: '#585B70',
  text: '#CDD6F4',
  keyword: '#CBA6F7',
  type: '#89DCEB',
  fn: '#89B4FA',
  string: '#A6E3A1',
  annotation: '#FAB387',
  comment: '#6C7086',
  number: '#F9E2AF',
  dotRed: '#F38BA8',
  dotYellow: '#F9E2AF',
  dotGreen: '#A6E3A1'
};

function tokenizeLine(line) {
  // Simple Kotlin syntax tokenizer for screenshot aesthetic
  if (line.trim().startsWith('//')) {
    return [{ text: line, color: COLORS.comment }];
  }
  if (line.trim().startsWith('@')) {
    return [{ text: line, color: COLORS.annotation }];
  }

  // Tokenize regex
  const regex = /(\/\/.*$|"(?:\\.|[^"\\])*"|@\w+|(?:\b(?:package|import|val|var|fun|class|data|interface|object|return|if|else|when|override|private|public|companion|true|false|null|get|set|is|as|in|while|for)\b)|(?:\b(?:String|Int|Float|Long|Boolean|List|StateFlow|Flow|Entity|PrimaryKey|Composable|Modifier|Unit)\b)|\b\d+(?:\.\d+)?f?\b|[A-Za-z_]\w*|[^\s\w]+|\s+)/g;

  const tokens = [];
  let match;
  while ((match = regex.exec(line)) !== null) {
    const word = match[0];
    if (word.startsWith('//')) {
      tokens.push({ text: word, color: COLORS.comment });
    } else if (word.startsWith('"')) {
      tokens.push({ text: word, color: COLORS.string });
    } else if (word.startsWith('@')) {
      tokens.push({ text: word, color: COLORS.annotation });
    } else if (/^(package|import|val|var|fun|class|data|interface|object|return|if|else|when|override|private|public|companion|true|false|null|get|set|is|as|in|while|for)$/.test(word)) {
      tokens.push({ text: word, color: COLORS.keyword });
    } else if (/^(String|Int|Float|Long|Boolean|List|StateFlow|Flow|Entity|PrimaryKey|Composable|Modifier|Unit|CollegeRepository|UserProfileEntity|AttendanceTargetEntity|NoteEntity|ChatMessageEntity|DynamicNoteDocument)$/.test(word)) {
      tokens.push({ text: word, color: COLORS.type });
    } else if (/^\d+(\.\d+)?f?$/.test(word)) {
      tokens.push({ text: word, color: COLORS.number });
    } else if (/^[A-Za-z_]\w*$/.test(word)) {
      // Check if followed by (
      const nextChar = line[regex.lastIndex];
      if (nextChar === '(') {
        tokens.push({ text: word, color: COLORS.fn });
      } else {
        tokens.push({ text: word, color: COLORS.text });
      }
    } else {
      tokens.push({ text: word, color: COLORS.text });
    }
  }
  return tokens.length ? tokens : [{ text: line, color: COLORS.text }];
}

async function renderCodeCard(filename, codeLines, outFileName) {
  const width = 1000;
  const lineHeight = 24;
  const headerHeight = 44;
  const paddingBottom = 24;
  const height = headerHeight + (codeLines.length * lineHeight) + paddingBottom;

  const img = PImage.make(width, height);
  const ctx = img.getContext('2d');

  // Background card with soft border
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // Window top bar
  ctx.fillStyle = COLORS.headerBg;
  ctx.fillRect(0, 0, width, headerHeight);

  // Border bottom of header
  ctx.fillStyle = COLORS.border;
  ctx.fillRect(0, headerHeight - 1, width, 1);

  // Outer border
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Mac window controls (Red, Yellow, Green dots)
  function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }
  drawCircle(22, 22, 6, COLORS.dotRed);
  drawCircle(42, 22, 6, COLORS.dotYellow);
  drawCircle(62, 22, 6, COLORS.dotGreen);

  // Header Title (filename)
  ctx.fillStyle = '#A6ADC8';
  ctx.font = "12pt 'DejaVuSansMono'";
  ctx.fillText(filename, 90, 27);

  // Draw Code Lines
  ctx.font = "11.5pt 'DejaVuSansMono'";
  const startY = headerHeight + 20;

  for (let i = 0; i < codeLines.length; i++) {
    const lineY = startY + (i * lineHeight);
    const lineNum = (i + 1).toString().padStart(2, ' ');

    // Line number column
    ctx.fillStyle = COLORS.lineNo;
    ctx.fillText(lineNum, 18, lineY);

    // Code tokens
    let curX = 64;
    const tokens = tokenizeLine(codeLines[i]);
    for (const t of tokens) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, curX, lineY);
      // Rough character width measurement for monospaced 11.5pt (approx 9.2px per char)
      curX += t.text.length * 9.25;
    }
  }

  const outPath = path.join(outputDir, outFileName);
  await PImage.encodePNGToStream(img, fs.createWriteStream(outPath));
  console.log(`Generated: ${outPath}`);
}

const snippets = [
  {
    name: 'Models.kt – Room Database Entities & Schema',
    file: 'code_1_models_entities.png',
    code: [
      '@Entity(tableName = "attendance_targets")',
      'data class AttendanceTargetEntity(',
      '    @PrimaryKey val subjectName: String,',
      '    val attendedSessions: Int,',
      '    val totalSessions: Int,',
      '    val targetPercentage: Int = 75',
      ') {',
      '    val percentage: Float',
      '        get() = if (totalSessions > 0) (attendedSessions.toFloat() / totalSessions) * 100 else 0f',
      '}',
      '',
      '@Entity(tableName = "lost_found")',
      'data class LostFoundEntity(',
      '    @PrimaryKey(autoGenerate = true) val id: Int = 0,',
      '    val title: String,',
      '    val description: String,',
      '    val location: String,',
      '    val contact: String,',
      '    val isLost: Boolean, // true if Lost, false if Found',
      '    val category: String = "Electronics",',
      '    val dateTimeStr: String = "",',
      '    val posterEmail: String = ""',
      ')'
    ]
  },
  {
    name: 'CollegeViewModel.kt – Smart Attendance Dampening Formula',
    file: 'code_2_dampening_algorithm.png',
    code: [
      '// Calculates realistic academic attendance percentage with non-linear dampening',
      'fun calculateAttendancePercentage(attended: Int, total: Int): Float {',
      '    if (total <= 0) return 0f',
      '    val raw = (attended.toFloat() / total) * 100f',
      '    return if (raw <= 80f) {',
      '        raw',
      '    } else {',
      '        // Beyond 80%, each percentage point of increase is dampened by 0.4',
      '        // This models university criteria where attendance gains taper realistically',
      '        80f + (raw - 80f) * 0.4f',
      '    }',
      '}',
      '',
      '// Computes safe classes student can miss or must attend to preserve 75%',
      'fun calculateBunkSafeMargin(attended: Int, total: Int, targetPct: Int = 75): Pair<Int, Boolean> {',
      '    val currentPct = (attended.toFloat() / total) * 100f',
      '    return if (currentPct >= targetPct) {',
      '        val canBunk = ((attended * 100 - targetPct * total) / targetPct)',
      '        Pair(canBunk, true) // Safe to miss',
      '    } else {',
      '        val mustAttend = ((targetPct * total - attended * 100) / (100 - targetPct)) + 1',
      '        Pair(mustAttend, false) // Must attend',
      '    }',
      '}'
    ]
  },
  {
    name: 'CollegeViewModel.kt – Realtime Firestore Snapshot Flow',
    file: 'code_3_firestore_realtime_sync.png',
    code: [
      '// Asynchronous real-time snapshot listener exposed as reactive StateFlow',
      'val sharedNotes: StateFlow<List<DynamicNoteDocument>> = callbackFlow {',
      '    val firestore = FirebaseFirestore.getInstance()',
      '    val listener = firestore.collection("shared_notes")',
      '        .addSnapshotListener { snapshot, error ->',
      '            if (error != null) {',
      '                Log.e("CollegeViewModel", "Error listening to shared_notes", error)',
      '                close(error)',
      '                return@addSnapshotListener',
      '            }',
      '            if (snapshot != null) {',
      '                val list = snapshot.documents.mapNotNull { doc ->',
      '                    doc.toObject(DynamicNoteDocument::class.java)?.copy(id = doc.id)',
      '                }.sortedByDescending { it.timestamp }',
      '                trySend(list)',
      '            }',
      '        }',
      '    awaitClose { listener.remove() } // Cleanup WebSocket listener on disposal',
      '}.catch { emit(emptyList()) }',
      ' .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())'
    ]
  },
  {
    name: 'LostFoundRepository.kt – Cloud Storage & Operations',
    file: 'code_4_lost_found_repository.png',
    code: [
      'class LostFoundRepository {',
      '    private val firestore = FirebaseFirestore.getInstance()',
      '    private val collection = firestore.collection("lost_found")',
      '',
      '    fun getLostFoundItemsRealtime(): Flow<List<FirestoreLostFoundItem>> = callbackFlow {',
      '        val subscription = collection',
      '            .orderBy("timestamp", Query.Direction.DESCENDING)',
      '            .addSnapshotListener { snapshot, error ->',
      '                if (error != null) { close(error); return@addSnapshotListener }',
      '                val items = snapshot?.documents?.mapNotNull { doc ->',
      '                    doc.toObject(FirestoreLostFoundItem::class.java)?.copy(id = doc.id)',
      '                } ?: emptyList()',
      '                trySend(items)',
      '            }',
      '        awaitClose { subscription.remove() }',
      '    }',
      '',
      '    suspend fun addLostFoundItem(item: FirestoreLostFoundItem): Boolean = suspendCoroutine { cont ->',
      '        collection.add(item)',
      '            .addOnSuccessListener { cont.resume(true) }',
      '            .addOnFailureListener { cont.resume(false) }',
      '    }',
      '}'
    ]
  },
  {
    name: 'MainDashboard.kt – Declarative Jetpack Compose UI',
    file: 'code_5_compose_dashboard_ui.png',
    code: [
      '@Composable',
      'fun SubjectAttendanceCard(',
      '    subject: SubjectAttendance,',
      '    onMarkPresent: () -> Unit,',
      '    onMarkAbsent: () -> Unit',
      ') {',
      '    Card(',
      '        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),',
      '        shape = RoundedCornerShape(16.dp),',
      '        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)',
      '    ) {',
      '        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {',
      '            CircularAttendanceIndicator(percentage = subject.percentage, modifier = Modifier.size(56.dp))',
      '            Spacer(modifier = Modifier.width(16.dp))',
      '            Column(modifier = Modifier.weight(1f)) {',
      '                Text(text = subject.subjectName, style = MaterialTheme.typography.titleMedium)',
      '                Text(text = "${subject.attended}/${subject.total} sessions logged", style = MaterialTheme.typography.bodySmall)',
      '            }',
      '            IconButton(onClick = onMarkPresent) { Icon(Icons.Default.Check, contentDescription = "Present") }',
      '            IconButton(onClick = onMarkAbsent) { Icon(Icons.Default.Close, contentDescription = "Absent") }',
      '        }',
      '    }',
      '}'
    ]
  },
  {
    name: 'CollegeCompanionUnitTest.kt – Robolectric JVM Testing',
    file: 'code_6_robolectric_unit_test.png',
    code: [
      '@RunWith(RobolectricTestRunner::class)',
      'class CollegeCompanionUnitTest {',
      '',
      '    @Test',
      '    fun testAttendanceDampeningCalculations() {',
      '        val vm = CollegeViewModel(ApplicationProvider.getApplicationContext(), mockRepo)',
      '',
      '        // 1. Standard linear scaling below 80%',
      '        val lowPct = vm.calculateAttendancePercentage(14, 20) // 70.0%',
      '        assertEquals(70.0f, lowPct, 0.01f)',
      '',
      '        // 2. Verified non-linear dampening above 80%',
      '        // Raw: 90% -> Expected: 80 + (90 - 80) * 0.4 = 84.0%',
      '        val highPct = vm.calculateAttendancePercentage(90, 100)',
      '        assertEquals(84.0f, highPct, 0.01f)',
      '    }',
      '',
      '    @Test',
      '    fun testBunkSafeMarginCalculation() {',
      '        val vm = CollegeViewModel(ApplicationProvider.getApplicationContext(), mockRepo)',
      '        val (margin, isSafe) = vm.calculateBunkSafeMargin(attended = 18, total = 20, targetPct = 75)',
      '        assertTrue("Should be safe to bunk", isSafe)',
      '        assertEquals(4, margin) // Can miss up to 4 upcoming classes safely',
      '    }',
      '}'
    ]
  }
];

async function run() {
  for (const s of snippets) {
    await renderCodeCard(s.name, s.code, s.file);
  }
  console.log('All 6 code images successfully generated!');
}

run();
