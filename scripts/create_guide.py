from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/dfa-presentation-guide.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='ArialBold', italic='Arial', boldItalic='ArialBold')
W,H=595.28,841.89
INK='#233e34'; GREEN='#2b7152'; MUTED='#6e8175'; LINE='#dfe7dd'
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle('SignalLab | Website explanation and presentation script')
c.setAuthor('SignalLab project')
styles={
 'body':ParagraphStyle('body',fontName='Arial',fontSize=10.2,leading=16,textColor=HexColor(INK),spaceAfter=8),
 'small':ParagraphStyle('small',fontName='Arial',fontSize=9,leading=14,textColor=HexColor(MUTED)),
 'heading':ParagraphStyle('heading',fontName='ArialBold',fontSize=13,leading=18,textColor=HexColor(INK)),
 'quote':ParagraphStyle('quote',fontName='Arial',fontSize=11,leading=18,textColor=HexColor(INK)),
}
y=0; page=0

def paragraph(text, style='body', gap=10):
 global y
 p=Paragraph(text,styles[style]); _,h=p.wrap(W-88,700)
 if y-h<62: raise ValueError(f'Page {page} overflow: {text[:60]}')
 p.drawOn(c,44,y-h); y-=h+gap

def heading(text): paragraph(text,'heading',8)
def start(part,title,subtitle):
 global y,page
 page+=1
 c.setFillColor(HexColor('#f7f9f5'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(HexColor(GREEN));c.rect(0,H-8,W,8,fill=1,stroke=0)
 c.setFont('ArialBold',11);c.drawString(44,H-43,'SignalLab')
 c.setFont('Arial',8);c.setFillColor(HexColor(MUTED));c.drawRightString(W-44,H-43,'FORMAL LANGUAGES & AUTOMATA THEORY')
 c.setStrokeColor(HexColor(LINE));c.line(44,H-57,W-44,H-57)
 c.setFillColor(HexColor(GREEN));c.setFont('ArialBold',9);c.drawString(44,H-87,part.upper())
 c.setFillColor(HexColor(INK));c.setFont('ArialBold',25);c.drawString(44,H-122,title)
 y=H-142;paragraph(subtitle,'small',23)

def end():
 c.setStrokeColor(HexColor(LINE));c.line(44,48,W-44,48)
 c.setFillColor(HexColor(MUTED));c.setFont('Arial',8);c.drawString(44,32,'SignalLab / Explanation & presentation companion')
 c.drawRightString(W-44,32,f'{page:02d}');c.showPage()

def table(rows,widths):
 global y
 data=[[Paragraph(str(v),styles['small']) for v in row] for row in rows]
 t=Table(data,colWidths=widths)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#e6efdf')),('BACKGROUND',(0,1),(-1,-1),white),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.5,HexColor(LINE)),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]))
 _,h=t.wrap(W-88,700)
 if y-h<62: raise ValueError(f'Table overflow page {page}')
 t.drawOn(c,44,y-h);y-=h+19

def callout(title,text):
 heading(title);paragraph(text)

start('Part 1 / How the website works','A traffic signal, explained.','A practical guide to the interface, the underlying DFA, and the distinction between the model and its animation.')
heading('The project in one sentence')
paragraph('SignalLab visualizes a deterministic finite automaton that validates traffic-light changes: <b>Red → Green → Yellow → Red</b>. Any repeated color or out-of-order change enters the non-accepting trap state.')
heading('Read the interface from left to right')
table([['Area','What it shows'],['01 · Live intersection','Cars, the monitored traffic signal, current state, next valid input, transition count and replay count.'],['02 · Build your sequence','The original valid and invalid presets, custom input, start/stop, single-step, reset and playback speed.'],['03 · The automaton','A live state diagram and the complete transition function. The current state and latest transition are highlighted.'],['04 · Transition trace','The latest 80 events, newest first. Start events and replay resets are labeled separately from actual transitions.'],['Formal definition & model notes','The five-tuple, acceptance language, scenario-start convention and modeling limitations.']],[145,362])
heading('What to watch during a run')
paragraph('The signal, state diagram, transition table and trace all reflect the same current DFA state. On green, cars accelerate through the intersection. On red, they approach and queue behind the line. On yellow, approaching cars stop while cars already committed finish crossing.')
paragraph('<b>Presentation route:</b> explain the screen → run a valid cycle → inspect the theory → trigger a fault → summarize what makes this a DFA. Part 2 gives you the exact words to use.','small')
end()

start('Part 1 / Website controls','Run, inspect, repeat.','Use automatic playback for the visual demonstration and single-step mode when explaining a particular transition.')
table([['Control','Behavior'],['Scenarios','Choose one of the eight original presets. Valid examples follow the color cycle; invalid examples deliberately break it.'],['Custom input','Enter individual R, G or Y symbols separated by spaces or commas. Lowercase is accepted. Combined symbols such as RG and unknown symbols are rejected.'],['Start simulation','Start a new run from the selected sequence. After manual stop or rejection, this begins again; it does not resume an old run.'],['Stop simulation','End automatic stepping, freeze traffic and display flashing amber. This is a demonstration control outside the DFA alphabet.'],['Advance one step','The first click initializes the sequence in step mode. Each subsequent click consumes the next input. Cars remain still so the theory can be discussed.'],['Run automatically','Continue the current run from step mode.'],['Reset simulation','Return to idle at qR; clear the trace and counters and restore car positions.'],['0.5× / 1× / 2×','Slow down or speed up the animation and signal dwell durations together. Changing speed restarts the current dwell timer.']],[125,382])
heading('The first symbol is a setup choice')
paragraph('For <b>R G Y R</b>, R selects the starting light. The consumed input word is <b>G Y R</b>. For <b>G R</b>, G selects qG and the input R demonstrates the illegal qG → qR change. This preserves the original local-scenario behavior.')
paragraph('A one-symbol sequence is a valid setup with no input transitions. Its replay counter may increase, but the transition count stays zero. Inputs cannot be edited during automatic playback or step mode; reset or stop first.','small')
end()

start('Part 1 / The formal model','The DFA behind the scene.','M = (Q, Σ, δ, q₀, F). The machine is deterministic because every state-input pair has one defined destination.')
table([['Component','Definition'],['Q · states','{qR, qG, qY, qD}'],['Σ · alphabet','{R, G, Y}'],['q₀ · formal initial state','qR'],['F · accepting states','{qR, qG, qY}'],['δ · transition function','δ : Q × Σ → Q, defined completely below.']],[185,322])
heading('The complete transition function')
table([['State / input','R','G','Y'],['qR','qD','qG','qD'],['qG','qD','qD','qY'],['qY','qR','qD','qD'],['qD','qD','qD','qD']],[185,107,107,108])
paragraph('<b>Valid edges:</b> δ(qR, G) = qG; δ(qG, Y) = qY; δ(qY, R) = qR. Every other input from a normal state goes to qD. The trap has a self-loop for each symbol.')
heading('Why three states are accepting')
paragraph('Acceptance means the input read so far obeys the allowed ordering. A valid input word need not end at red or complete a full cycle. The double circles in the diagram indicate qR, qG and qY are accepting; qD has only one circle.')
paragraph('The alphabet is made of signal-change symbols. Cars, seconds, playback speed, start, stop and reset are not members of Σ.','small')
end()

start('Part 1 / Worked examples','Follow the input word.','Always state the starting configuration before describing the consumed inputs.')
heading('Example A: the valid preset R G Y R')
table([['Action','DFA result','Meaning'],['Setup R','Start at qR','No symbol consumed yet'],['Read G','δ(qR, G) = qG','Valid; green is lit'],['Read Y','δ(qG, Y) = qY','Valid; yellow is lit'],['Read R','δ(qY, R) = qR','Valid; red is lit']],[110,177,220])
heading('Example B: the invalid preset R Y')
paragraph('Initialize qR, then consume Y. The table says <b>δ(qR, Y) = qD</b>, because green was skipped. The diagram highlights the invalid edge, the table highlights the qR/Y cell, the trace records the rejection and traffic freezes. The demonstration halts at the first invalid transition.')
heading('The trap remains a trap')
paragraph('Mathematically, any remaining R, G or Y inputs would keep the machine in qD. The interface stops consuming them so the fault is easy to inspect. Pressing Reset or starting a new run creates a new execution; neither is an escape edge in the DFA.')
heading('What language is accepted from qR?')
paragraph('The accepted words are all finite prefixes of the repeating word <b>GYRGYRGYR…</b>. A regular expression is <b>(GYR)*(ε | G | GY)</b>. Here ε denotes the empty word. Examples: ε, G, GY, GYR and GYRG. Words R, Y, GG and GR are rejected from qR.')
paragraph('The formal DFA accepts ε because qR is accepting. The UI requires at least a starting-light symbol to configure a scenario; an empty text field is therefore disabled. Scenarios starting at G or Y are local demonstrations, not formal runs beginning at q₀.','small')
end()

start('Part 1 / Timing & implementation','One model. Several views.','The DFA decides validity; the surrounding simulation makes those decisions visible.')
heading('How the implementation connects')
paragraph('<b>dfa.js</b> defines the transition table, scenarios, strict parser and run advancement. <b>App.jsx</b> holds the current run and drives the timer, diagram, table and trace. <b>traffic.js</b> updates car positions and safe following distances. <b>Intersection.jsx</b> draws the road and vehicles and animates them with requestAnimationFrame.')
heading('Timing at normal speed')
table([['Light','Display duration','Visible traffic behavior'],['Red','4.2 seconds','Approach the stop line and queue'],['Green','4.2 seconds','Accelerate and cross'],['Yellow','1.9 seconds','Brake before the line; committed cars clear']],[95,125,287])
paragraph('These durations are visualization settings, not constraints enforced by the DFA. Vehicle motion uses elapsed time, acceleration and braking. The front bumper is the reference for the stop line; cars keep a minimum following gap. Vehicles leaving the scene return off-screen behind the queue.')
heading('Automatic replay is a new demonstration')
paragraph('At the end of a valid scenario, the UI resets to its first symbol and labels a <b>Replay reset</b> event. This is outside δ. If the ending and starting colors match, the duplicate dwell is skipped. The counter measures scenario replays, not necessarily completed physical traffic cycles.')
heading('Scope and limitations')
paragraph('The model validates one monitored approach. It does not coordinate a complete intersection, sense vehicles, control pedestrians, enforce real-world timing or provide emergency preemption. A plain DFA has no clock. Timing constraints require an extension such as a timed automaton.')
paragraph('The signal output depends only on the current state, which is a Moore-style output mapping. DFA acceptance and the visual output are related layers, not interchangeable definitions. Flashing fault and manual-stop indicators are demonstration conventions.','small')
end()

start('Part 2 / What to say','Your opening & valid demo.','Suggested speaking time: 2-3 minutes. Text in quotes is ready to say; action notes tell you what to click.')
heading('1. Introduce the purpose')
paragraph('“This is SignalLab, a traffic-light simulator for Formal Languages and Automata Theory. It demonstrates how a deterministic finite automaton can validate a sequence of signal changes. Our rule is red to green, green to yellow, and yellow back to red.”','quote')
heading('2. Orient the audience')
paragraph('“On the left is the animated intersection. Below it I can choose a scenario or enter my own sequence. On the right are the live state diagram and transition table. They stay visible while the animation runs, so we can connect each visible signal change with its formal transition.”','quote')
heading('3. Start the valid example')
paragraph('<b>Action:</b> Select Full cycle and click Start simulation. Use 1× speed. Keep the diagram and table visible.','small')
paragraph('“This sequence is R, G, Y, R. The first R sets the starting light to red. The actual input symbols are G, Y and R. When G is read from qR, the transition function gives qG, so the green light turns on and the cars move. Then Y takes us to qY. Finally R takes us back to qR.”','quote')
heading('4. Connect movement to the state')
paragraph('“The animation follows the state: cars queue on red, accelerate on green and brake on yellow. A car already past the stop line completes its crossing. These motion details help visualize the result; the DFA itself only validates the order of the signal changes.”','quote')
paragraph('<b>Presenter tip:</b> If the sequence moves too fast, reset and use Advance one step. The first click selects the starting state; later clicks consume one input each. You can then explain the highlighted table cell at your own pace.','small')
end()

start('Part 2 / What to say','Explain the model & fault.','Suggested speaking time: 2-3 minutes. Use the invalid example to make determinism and the trap state concrete.')
heading('5. State the five-tuple')
paragraph('“Formally, M is the five-tuple Q, sigma, delta, q-zero and F. Q contains qR, qG, qY and qD. Sigma contains R, G and Y. The formal initial state is qR. The accepting states are qR, qG and qY, because each represents a valid sequence so far. qD is the only non-accepting state.”','quote')
heading('6. Explain determinism')
paragraph('“The table defines exactly one destination for every state and input. For example, delta of qR and G equals qG. There are no alternative branches for the same pair. The transition function is total because all twelve state-input combinations are defined, including the trap-state row.”','quote')
heading('7. Trigger and explain rejection')
paragraph('<b>Action:</b> Click Reset, choose Skips green, then click Start simulation. Wait for R → Y to be rejected.','small')
paragraph('“Now I am testing R followed by Y. Red is the starting light and Y is the input. This skips green, so delta of qR and Y is qD. The trace records the invalid transition and the simulator halts. qD is absorbing: any further R, G or Y would keep the machine in qD.”','quote')
heading('8. Close with the right limitation')
paragraph('“This is an educational model of signal-order validation, not a complete road controller. The timing, vehicle movement and manual controls belong to the simulation layer. The main FLAT idea is that a finite set of states and one deterministic transition rule are enough to recognize whether the sequence follows the allowed pattern.”','quote')
paragraph('<b>Optional closing line:</b> “The project makes the abstract transition function visible: one input changes the DFA state, the highlighted edge, the table cell and the traffic signal together.”','small')
end()

start('Part 2 / Presentation questions','Be ready for the follow-up.','Short answers to the questions most likely to arise during a classroom explanation.')
for title,body in [
 ('Why is this a DFA rather than an NFA?','Every state-input pair has exactly one next state. There is no nondeterministic choice and no need for backtracking.'),
 ('Why does R → R fail?','In this project, symbols represent requested changes. A repeated color is deliberately treated as invalid. That is a modeling decision, not a universal traffic-law rule.'),
 ('Why is qG accepting if the cycle is unfinished?','Acceptance means the prefix read so far is valid. The language does not require a complete return to red.'),
 ('Does qD have self-loops?','Yes. R, G and Y all map qD back to qD. Only the three normal states reject repeated-color self-transitions.'),
 ('Can a sequence start at green?','The UI allows a local demonstration starting at qG. The formal DFA initial state is still qR. The first displayed symbol configures the demonstration.'),
 ('Is the timer part of the automaton?','No. It schedules visualization steps. A DFA alone has no elapsed-time variable; explicit timing constraints need a richer model.'),
 ('Does replay validate the boundary between runs?','No. Replay is an explicit reset to the scenario start and is labeled separately. Acceptance is evaluated within each demonstration.'),
 ('What should I demonstrate if time is short?','Run Full cycle, identify one valid table entry, then run Skips green and explain qD. Finish by stating that exactly one outcome exists for every state-input pair.'),
]:
 heading(title);paragraph(body,gap=10)
paragraph('<b>Before presenting:</b> open the site, keep the page near the top, use a desktop-width window for side-by-side theory, and have this PDF available locally. Source of truth: the project’s dfa.js, traffic.js, App.jsx and Intersection.jsx.','small',0)
end()
c.save()
shutil.copyfile(OUT, ROOT/'public/dfa-presentation-guide.pdf')
print(OUT)
print(f'{page} pages created')
