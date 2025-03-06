var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game');

var mainState = {
    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';

        // Create an in-memory image for the bird
        var birdImg = new Image();
        birdImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        birdImg.onload = function () {
            game.cache.addImage('bird', birdImg.src, birdImg);
        };

        // Create an in-memory image for the pipe
        var pipeImg = new Image();
        pipeImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        pipeImg.onload = function () {
            game.cache.addImage('pipe', pipeImg.src, pipeImg);
        };
    },

    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');  
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);           

        this.bird = this.game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000; 

        this.bird.anchor.setTo(-0.2, 0.5); 

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 

        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  

        this.jumpSound = game.add.audio('jump');
    },

    update: function() {
        if (!this.bird.inWorld) this.restartGame(); 

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 

        if (this.bird.angle < 20) this.bird.angle += 1;   
    },

    jump: function() {
        if (!this.bird.alive) return; 

        this.bird.body.velocity.y = -350;
        game.add.tween(this.bird).to({angle: -20}, 100).start();
    },

    hitPipe: function() {
        if (!this.bird.alive) return;

        this.bird.alive = false;
        this.game.time.events.remove(this.timer);

        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    restartGame: function() {
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -200;  
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        var hole = Math.floor(Math.random() * 5) + 1;
        
        for (var i = 0; i < 8; i++) {
            if (i !== hole && i !== hole + 1) {
                this.addOnePipe(400, i * 60 + 10);
            }
        }

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

game.state.add('main', mainState);  
game.state.start('main');
