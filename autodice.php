<!DOCTYPE html>
<html>
    <head>
        <title>AutoDicer</title>
        <script type='text/javascript'>
            var m_ChildWindow = null; // 
            var parent_notation = null;
            var parent_roll = null;

            function OpenChildWIndow() {
                m_ChildWindow = window.open("index.php");
            }

            function RollDice(notation) {
                if (m_ChildWindow) {
                    parent_notation = m_ChildWindow.document.getElementById('parent_notation');
                    parent_roll = m_ChildWindow.document.getElementById('parent_roll');

                    parent_notation.value = $t.id('notation').value;
                    parent_roll.value = "1";
                    $t.raise(parent_notation, 'change');
                    $t.raise(parent_roll, 'change');
                }
            }
        </script>
    </head>
    <body>
        <button onclick='OpenChildWIndow();'>Open Dice window</button>
        <br><br>
        <input type="text" id="notation">
        <button onclick='RollDice();'>Roll Dice</button>
        <script type="text/javascript" src="./includes/teal.js"></script>
    </body>
</html>