# Tetris bot
A simple tetris AI written in JS that I found in my archive. It was a good exercise for learning the basics of setting up a tetris game in JS, interracting with the user and applying the basics of machine learning.


The parameters (total height, row count, hole count, bumpiness) are used to evaluate a position. The training process computed four weights, one for each of those parameters. Then each possible piece position gets evaluated and the best piece placement is picked. 

The parameters are trained for longevity. This means that the bot will almost never lose. It also means that the bot will opt for removing lines rather than playing tetrisses (4 lines at once with an I piece) and achieving the highest possible score.  

Try it for yourself. Get the code and run the html on a live server. You have access to the inputs together with the AI, so that you can create a more difficult position for it to break down. Comment line 217 to disable the AI and play yourself :)


<img src="https://github.com/MarkRamosS/tetris_bot/assets/92984006/ef008896-3bca-4df1-a231-f4d5a590a1a4" width="200" height="250"/>
