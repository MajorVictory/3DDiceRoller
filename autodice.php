<!DOCTYPE html>
<html>
    <head>
        <title>AutoDicer</title>
        <script type='text/javascript'>
            var m_ChildWindow = null;


            function OpenChildWIndow() {
                m_ChildWindow = window.open("http://dnd.majorsplace.com/dicex");
            }

            function RollDice() {
                if (m_ChildWindow) {

                    let notation = $t.id('notation').value;

                    m_ChildWindow.postMessage(notation);
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