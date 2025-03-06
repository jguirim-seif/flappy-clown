var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');

var mainState = {
    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==");
        game.load.image('pipe', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==");
    },

    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');  

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.bird = game.add.sprite(100, game.world.centerY, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000; 

        this.bird.anchor.setTo(-0.2, 0.5); 

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        this.finalScoreText = game.add.text(game.world.centerX, game.world.centerY, "", 
            { font: "50px Arial", fill: "#ff0000", align: "center" });
        this.finalScoreText.anchor.setTo(0.5, 0.5);
        this.finalScoreText.visible = false;

        this.bird.alive = true; // Fix: Ensure the bird starts alive
    },

    update: function() {
        if (this.bird.alive) {
            if (!this.bird.inWorld) this.endGame(); 
            game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
            if (this.bird.angle < 20) this.bird.angle += 1;   
        }
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

        this.pipes.forEachAlive(function(p) {
            p.body.velocity.x = 0;
        }, this);

        this.endGame();
    },

    endGame: function() {
        if (!this.bird.alive) return; 

        this.bird.alive = false;
        this.finalScoreText.text = "Game Over\nScore: " + this.score;
        this.finalScoreText.visible = true;

        game.time.events.add(2000, function() {
            game.state.start('main');
        }, this);
    },

    addOnePipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();
        if (pipe) {
            pipe.reset(x, y);
            pipe.body.velocity.x = -200;  
            pipe.checkWorldBounds = true;
            pipe.outOfBoundsKill = true;
        }
    },

    addRowOfPipes: function() {
        var hole = Math.floor(Math.random() * 5) + 1;

        for (var i = 0; i < 8; i++) {
            if (i !== hole && i !== hole + 1) {
                this.addOnePipe(game.world.width, i * 60 + 10);
            }
        }

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

game.state.add('main', mainState);  
game.state.start('main');

window.addEventListener("resize", function() {
    game.scale.setGameSize(window.innerWidth, window.innerHeight);
});
