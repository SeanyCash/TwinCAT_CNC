+ =======================================
+ ---
+ Version 1
+   Tony     15/11/2005 Written
+   Tony     06/01/2006 Added ATC option
+   Tony     14/05/2006 Fixed G20 inch in header
+   Tony     24/07/2006 Added G2 & G3 Arc support + removed (( ))
+   Tony     18/06/2007 Replaced the Tool comment
+   Mark     14/08/2008 Added G1 to Feed moves,
+   Removed 2nd G20 in header.
+   Mark     28/08/2009 Added G91.1 to force use of incremental arcs
+   Added Substitution, File & Toolpath Notes.
+   Mark     30/11/2009 Added TOOLPATHS_OUTPUT.
+   Brian    15/12/2009 Remove M05 from NEW_SEGMENT
+   Mark     18/01/2014 Added Dwell
+   Nathan   14/03/2017 OEM Customized
+   Added M6 toolchange
+   Added Dust Collector M7 Enable
+   Drew     17/07/2019 Added G71 to fix units in header
+   10/09/2019 Added Toolchange to header
+   04/23/2020 Added helical arc commands
+   Added Material and setup information to header
+ ---
+ Version 2
+   Adding post revision block.
+ ---
+ Version 3
+   Bumping internal version number as requested by Avid support.
+ =======================================


POST_NAME = "Beckhoff CNC (mm) (*.NC)"

FILE_EXTENSION = "NC"

UNITS = "MM"

DIRECT_OUTPUT = "Mach|Mach4.Document"

SUBSTITUTE = "({)}"

+------------------------------------------------
+    Line terminating characters
+------------------------------------------------

LINE_ENDING = "[13][10]"

+------------------------------------------------
+    Block numbering
+------------------------------------------------

LINE_NUMBER_START     = 0
LINE_NUMBER_INCREMENT = 1
LINE_NUMBER_MAXIMUM = 999999

+================================================
+
+    Formatting for variables
+
+================================================

VAR LINE_NUMBER = [N|A|N|1.0]
VAR SPINDLE_SPEED = [S|A|S|1.0]
VAR FEED_RATE = [F|C|F|1.1]
VAR X_POSITION = [X|C|X|1.3]
VAR Y_POSITION = [Y|C|Y|1.3]
VAR Z_POSITION = [Z|C|Z|1.3]
VAR ARC_CENTRE_I_INC_POSITION = [I|A|I|1.3]
VAR ARC_CENTRE_J_INC_POSITION = [J|A|J|1.3]
VAR X_HOME_POSITION = [XH|A|X|1.3]
VAR Y_HOME_POSITION = [YH|A|Y|1.3]
VAR Z_HOME_POSITION = [ZH|A|Z|1.3]
VAR SAFE_Z_HEIGHT = [SAFEZ|A|Z|1.3]
VAR DWELL_TIME = [DWELL|A|P|1.2]

+================================================
+
+    Block definitions for toolpath output
+
+================================================

begin REVISION_COMMENT

"(VECTRIC POST REVISION)"
"([REVISION])"

+---------------------------------------------------
+  Commands output at the start of the file
+---------------------------------------------------

begin HEADER

"( [TP_FILENAME] )"
"( File created: [DATE] - [TIME])"
"( for Beckhoff CNC Machines, post processor v1.0 )"
"( Material Size: X= [XLENGTH], Y= [YLENGTH], Z= [ZLENGTH])"
"( Z Origin for Material  = [Z_ORIGIN])"
"( XY Origin for Material = [XY_ORIGIN])"
"( Min Program Extents: X= [XMIN], Y= [YMIN], Z= [ZMIN])"
"( Max Program Extents: X= [XMAX], Y= [YMAX], Z= [ZMAX])"
"( Home Position: X =[XH] Y =[YH] Z =[ZH])"
"( Safe Z = [SAFEZ])"
"([FILE_NOTES])"
"(Toolpaths used in this file:)"
"([TOOLPATHS_OUTPUT])"
"(Tools used in this file: )"
"([TOOLS_USED])"

"[N] G00 G21 G17 G90 G40 G49 G80"
"[N] T[T]M6"
"[N] M07"
"[N] G00G43[ZH]H[T]"
"[N] [S]M03"
"(Toolpath: [TOOLPATH_NAME] Tool: [TOOLNAME])"
"[N] G94"
"[N] [XH][YH][F]"

+---------------------------------------------------
+  Commands output for rapid moves
+---------------------------------------------------

begin RAPID_MOVE

"[N] G00 [X] [Y] [Z]"

+---------------------------------------------------
+  Commands output at toolchange
+---------------------------------------------------

begin TOOLCHANGE
"M5"
"(Change to Tool: [TOOLNAME])"
"[N] T[T] M6"


+---------------------------------------------------
+  Commands output for the first feed rate move
+---------------------------------------------------

begin FIRST_FEED_MOVE

"[N] G1 [X] [Y] [Z] [F]"


+---------------------------------------------------
+  Commands output for feed rate moves
+---------------------------------------------------

begin FEED_MOVE

"[N] G1 [X] [Y] [Z]"

+---------------------------------------------------
+  Commands output for the first clockwise arc move
+---------------------------------------------------

begin FIRST_CW_ARC_MOVE

"[N] G2 [X] [Y] [I] [J] [F]"

+---------------------------------------------------
+  Commands output for clockwise arc  move
+---------------------------------------------------

begin CW_ARC_MOVE

"[N] G2 [X] [Y] [I] [J]"

+---------------------------------------------------
+  Commands output for the first counterclockwise arc move
+---------------------------------------------------

begin FIRST_CCW_ARC_MOVE

"[N] G3 [X] [Y] [I] [J] [F]"

+---------------------------------------------------
+  Commands output for counterclockwise arc  move
+---------------------------------------------------

begin CCW_ARC_MOVE

"[N] G3 [X] [Y] [I] [J]"

+---------------------------------------------------
+  Commands output for the first clockwise helical arc move
+---------------------------------------------------

begin FIRST_CW_HELICAL_ARC_MOVE

"[N] G2 [X] [Y] [Z] [I] [J] [F]"


+---------------------------------------------------
+  Commands output for clockwise helical arc move
+---------------------------------------------------

begin CW_HELICAL_ARC_MOVE

"[N] G2 [X] [Y] [Z] [I] [J]"


+---------------------------------------------------
+  Commands output for the first counterclockwise helical arc move
+---------------------------------------------------

begin FIRST_CCW_HELICAL_ARC_MOVE

"[N] G3 [X] [Y] [Z] [I] [J] [F]"


+---------------------------------------------------
+  Commands output for counterclockwise helical arc move
+---------------------------------------------------

begin CCW_HELICAL_ARC_MOVE

"[N] G3 [X] [Y] [Z] [I] [J]"


+---------------------------------------------------
+  Commands output for the first clockwise helical arc plunge move
+---------------------------------------------------

begin FIRST_CW_HELICAL_ARC_PLUNGE_MOVE

"[N] G2 [X] [Y] [Z] [I] [J] [F]"


+---------------------------------------------------
+  Commands output for clockwise helical arc plunge move
+---------------------------------------------------

begin CW_HELICAL_ARC_PLUNGE_MOVE

"[N] G2 [X] [Y] [Z] [I] [J]"


+---------------------------------------------------
+  Commands output for the first counter clockwise helical arc plunge move
+---------------------------------------------------

begin FIRST_CCW_HELICAL_ARC_PLUNGE_MOVE

"[N] G3 [X] [Y] [Z] [I] [J] [F]"


+---------------------------------------------------
+  Commands output for counter clockwise helical arc plunge move
+---------------------------------------------------

begin CCW_HELICAL_ARC_PLUNGE_MOVE

"[N] G3 [X] [Y] [Z] [I] [J]"



+---------------------------------------------------
+  Commands output for a new segment - toolpath
+  with same toolnumber but maybe different feedrates
+---------------------------------------------------

begin NEW_SEGMENT
"[N] [S] M03"
"(Toolpath: [TOOLPATH_NAME] Tool: [TOOLNAME])"

+---------------------------------------------
+  Commands output for a dwell move
+---------------------------------------------

begin DWELL_MOVE

"[N] G04 [DWELL]"

+---------------------------------------------------
+  Commands output at the end of the file
+---------------------------------------------------

begin FOOTER

"[N] G00 [ZH]"
"[N] G00 [XH][YH]"
"[N] M05"
"[N] M09"
"[N] M30"
%

