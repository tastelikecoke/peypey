"use strict";

/* singletons */

var text = {
    init: function(){
        text = game.add.text(game.world.centerX, game.world.centerY, '0');
        text.anchor.set(0.5);
        text.font = 'Verdana';
        text.fontSize = 36;
        text.fill = '#ffffff';
        text.text = "...";

    },
}
var judge = {
    perfectwindow: 50,
    okwindow: 100,
    score: 0,
    init: function(frame){
        judge.frame = frame;
        judge.scoretext = game.add.text(game.world.centerX, game.world.centerY, '0');
        judge.scoretext.anchor.set(0.5);
        judge.scoretext.font = 'Verdana';
        judge.scoretext.fontSize = 36;
        judge.scoretext.fill = '#ffffff';
        judge.scoretext.alpha = 1;
    },
}

var Music = {
    /* a prototype function. do not use */
    loaded: false,
    init: function(json){
        this.sound = game.add.audio('tear');
        this.restart_off = 0;
        this.offset = json.offset;
        this.period = json.period;
        this.t = 0;
        this.prevt = 0;
        this.loaded = true;
    },

    update: function(){
        this.prevt = this.t;
        if(this.loaded){
            this.t = this.sound.currentTime + this.restart_off;
        }
        if(this.prevt >= this.t){
            this.t += game.time.physicsElapsed;
        }
    },

}

var BeatList = {
    init: function(json){
        this.beatlist = json.beatlist;
        this.beats = [];
        this.pos = 0;
    },
    beatdata: function(){
        return this.beatlist[this.pos];
    },
    queuebeat: function(){
        var beatlistlength = this.beatlist.length;

        while(this.pos != beatlistlength && this.beatdata()[0] - music.t <= 4000){
            var beatdata = this.beatdata();
            
            var beat = game.add.sprite(game.world.centerX, 100, 'emoji');
            beat.inputEnabled = true;
            beat.anchor.setTo(0.5, 0.5);
            beat.timing = beatdata[0];
            beat.lane = beatdata[1];
            beat.glyph = beatdata[2];
            beat.x = (widths/4) + beat.lane*(widths/4);
            beat.frame = beat.glyph;
            beat.erased = false;  
            this.beats.push(beat);
            
            this.pos += 1;
        }
    },

    killall: function(){
        this.beats.forEach(function(e,i,a){
            e.kill();
        });
    },

    update: function(){
        var beatsnew = [];
        this.beats.forEach(function(e,i,a){
            e.y = (heights*5/6) - ((e.timing - music.t)/judge.frame * (heights*5/6));

            if(music.t - e.timing >= 300){
                if(e.frame != 208 && e.frame != 46){
                    e.frame = 86;
                }
            }

            if(e.y >= heights || e.erased){
                e.kill();
            }
            else{
                beatsnew.push(e);
            }
        });
        this.beats = beatsnew;
    }
}

var LineList = {
    init: function(){
        this.lines = [];
        this.linecover = 850;
    },

    update: function(){
        var t = music.t;
        var linesnew = [];
        if(this.linecover < t+2000){
            this.linecover = Math.round((this.linecover-music.offset)/music.period)*music.period + music.offset;

            var line = game.add.sprite(game.world.centerX, 100, 'line');
            line.anchor.setTo(0.5, 0.5);
            line.timing = this.linecover;
            console.log(line.timing+" "+ music.period);
            this.lines.push(line);
            this.linecover += music.period;
        }
        this.lines.forEach(function(e,i,a){
            e.y = 500 - ((e.timing - t)/judge.frame * 400);
            if(e.y >= 600 || e.erased){
                e.kill();
            }
            else{
                linesnew.push(e);
            }
        });
        this.lines = linesnew;
    }
}

var TapList = {
    init: function(){
        this.taps = [];
    },

    addtap: function(lane, glyph){
        var tap = game.add.sprite(game.world.centerX, 100, 'emoji');
        
        tap.anchor.setTo(0.5, 0.5);
        tap.x = (widths/4) + lane*(widths/4);
        tap.y = (heights*5/6);
        tap.scale.setTo(3.0, 3.0);
        tap.frame = glyph;

        this.taps.push(tap);
    },

    update: function(){
        var tapsnew = [];
        this.taps.forEach(function(e,i,a){
            e.alpha -= 0.1*(1.05 - e.alpha);
            e.scale.setTo(1.0+e.alpha, 1.0+e.alpha);
            if(e.alpha < 0.01){
                e.kill();
            }
            else{
                tapsnew.push(e);
            }
        });
        this.taps = tapsnew;
    }
}

var stage = {
    update: function(){
        console.log("Nothing to stage");
    }
}


function preload(){
}

function create(){

    /* loads the prestage */
    game.stage.backgroundColor = 0x999999;

    game.load.onLoadStart.add(loadStart, this);
    game.load.onLoadComplete.add(loadComplete, this);

    game.load.audio('tear', 'assets/tearrain.mp3');
    game.load.image('marisa', 'assets/marisa2.png');
    game.load.image('tewi', 'assets/tewi.png');
    game.load.image('load', 'assets/load.png');
    game.load.image('rem', 'assets/rem.png');
    game.load.image('line', 'assets/line.png');
    game.load.image('fall2', 'assets/fall2.png');
    game.load.spritesheet('emoji', 'assets/apple.png', 32, 32, 1681);
    game.load.text('song', 'assets/song.json');

    text.init();

    game.load.start();
}

function update(){
    stage.update();
}

function render() {
}

function loadStart(){
    /* loads everything at the start */
    text.text = "Loading";
}

var music = {};
var beatlist = {};
var linelist = {};
var taplist = {};

function loadComplete(){

    /* loads the stage */
    text.text = "Loaded";

    music = Object.create(Music);
    beatlist = Object.create(BeatList);
    linelist = Object.create(LineList);
    taplist = Object.create(TapList);

    var marisa1 = game.add.sprite(0, 0, 'marisa');

    var json = JSON.parse(game.cache.getText('song'));
    music.init(json);
    beatlist.init(json);
    judge.init(music.period * 2);
    linelist.init();
    taplist.init();

    music.sound.play();

    scanline = game.add.sprite(widths/2, heights*5/6, 'fall2');
    scanline.anchor.setTo(0.5, 0.5);
    scanline.scale.setTo(320/800.0,320/800.0);

    key.z = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    key.x = game.input.keyboard.addKey(Phaser.Keyboard.X);
    key.c = game.input.keyboard.addKey(Phaser.Keyboard.C);
    key.z.onDown.add(keyActivate('z'));
    key.x.onDown.add(keyActivate('x'));
    key.c.onDown.add(keyActivate('c'));

    if(debug){
        key.v = game.input.keyboard.addKey(Phaser.Keyboard.V);
        key.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
        key.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
        key.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
        key.v.onDown.add(keyActivate('v'));
        key.a.onDown.add(keyActivate('a'));
        key.s.onDown.add(keyActivate('s'));
        key.d.onDown.add(keyActivate('d'));
        //game.input.onUp.add(mouseActivate, this);
        game.input.onTap.add(mouseKeyActivate, this);
    }
    else{
        game.input.onTap.add(mouseKeyActivate, this);
    }

    stage.update = function(){
        music.update();

        if (music.sound.isDecoding){
            text.text = "Loading song";
            game.world.bringToTop(text);
            return;
        }
        else{
            text.text = "";
        }
        beatlist.queuebeat();
        beatlist.update();
        linelist.update();
        taplist.update();
    }

}

function mouseKeyActivate(tap){
    var lane = Math.round((tap.x-widths/4)/(widths/4));
    console.log(lane);
    if(lane == 0) keyActivate('z')();
    if(lane == 1) keyActivate('x')();
    if(lane == 2) keyActivate('c')();
}

function mouseActivate(key){
    /*
    var t = music.sound.currentTime + music.restart_off;

    var mousey = game.input.mousePointer.y;
    var dist = (((heights*5/6) - mousey)/(heights*2/3) * judge.frame);
    console.log(dist + t);

    var skip = false;

    sprites.forEach(function(e,i,a){
        var spritedist = (e.y-mousey)*(e.y-mousey) + (e.x-game.input.mousePointer.x)*(e.x-game.input.mousePointer.x);
        if(spritedist < 100){
            e.erased = true;
            skip = true;

            for(var i=0; i < beats.length; i++){
                var f = beats[i];
                console.log();
                if(Math.abs(f[0]-e.timing) < 0.1 && Math.abs(f[1]-e.lane) < 0.1 &&  Math.abs(f[2]-e.glyph) < 0.1){
                    console.log("match"+beats[i]);
                    beats.splice(i,1);
                    break;
                }
            }
        }
    });
    if(skip){
        sprites.forEach(function(e,i,a){
            e.kill();
        });
        sprites = [];

        beatpos = 0;
        while(beats[beatpos][0] < t-1000){
            beatpos += 1;
        }
        return;
    }

    var beat = game.add.sprite(game.world.centerX, 100, 'emoji');
    beat.anchor.setTo(0.5, 0.5);
    
    var nearest = Math.round(((dist + t)-music.offset)/music.period*2.0)*music.period/2.0 + music.offset;
    beat.timing = nearest;

    beat.lane = Math.round((game.input.mousePointer.x - (widths/4))/(widths/4));
    beat.glyph = 10;
    beat.x = (widths/4) + beat.lane*(widths/4);
    beat.frame = beat.glyph;
    sprites.push(beat);
    sprites.sort(function(a, b){
        return a.timing - b.timing;
    });

    beats.push([beat.timing, beat.lane, beat.glyph]);
    beats.sort(function(a, b){
        return a[0] - b[0];
    });
    console.log(beats);

    beatpos = 0;
    while(beats[beatpos][0] < t-1000){
        beatpos += 1;
    }*/
}


function keyActivate(key){
    return function(){
        if(key == 's' || key == 'd'){
            if(music.sound.isPlaying == true){
                music.sound.pause();
            }
            var off = music.t;
            var added = 0;

            if(key == 's'){
                added -= music.period*2;
            }
            else if(key == 'd'){
                added += music.period*2;
            }

            beatlist.killall();

            off += added;
            if(off < 0) off = 0;
            music.sound.restart('', off/1000.0);
            music.restart_off = off;

            beatlist.pos = 0;
            while(beatlist.beatdata()[0] < off-1000){
                beatlist.pos += 1;
            }

            return;
        }

        else if(key == 'a'){
            if(music.sound.isPlaying == true){
                music.sound.pause();
            }
            else{
                music.sound.resume();
            }
        }

        else if(key == 'v'){
            beatlist.killall();
            music.sound.restart('', music.offset/1000.0);
            music.restart_off = music.offset;
            beatlist.pos = 0;
            return;
        }


        beatlist.beats.forEach(function(e,i,a){
            var gap = Math.abs(e.timing - music.t);
            
            if(gap > 300){
            }
            else if(gap < judge.okwindow){
                var keymapper = {'z':0, 'x':1, 'c': 2};
                if(e.lane == keymapper[key]){
                    if(gap < judge.perfectwindow){
                        /* perfect shot! */
                        e.kill();
                        judge.score += 100;
                        taplist.addtap(e.lane, e.glyph);
                    }
                    else{
                        /* ok shot. */
                        e.kill();
                        judge.score += 50;
                        taplist.addtap(e.lane, e.glyph);
                    }
                    console.log(judge.score);
                }
            }
        });
    }
}