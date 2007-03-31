/******************************\
|        Psych Desktop         |
|       Taskbar  Script        |
|    (c) 2006 Psych Designs    |
\******************************/

start();

function start()
{
x = document.body.clientWidth;
y = document.body.clientHeight;
var taskbar = document.createElement('div');
taskbar.id = 'taskbar';
taskbar.innerHTML = 'whee';
taskbar.appendChild(taskbar);

}