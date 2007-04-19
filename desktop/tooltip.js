/****************************\
|        Psych Desktop       |
|   Tooltip Engine Library   |
|   (c) 2006 Psych Designs   |
\***************************/ 

api.toaster = function(message){
dojo.event.topic.publish("psychdesktop", message);
}