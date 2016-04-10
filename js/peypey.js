"use strict";

/* singletons */

function makerect(x, y, w, h, fill='#ffffff'){
    var bitmap = game.add.bitmapData(w, h);
    bitmap.ctx.beginPath();
    bitmap.ctx.rect(0, 0, w, h);
    bitmap.ctx.fillStyle = fill;
    bitmap.ctx.fill();
    var sprite = game.add.sprite(x, y, bitmap);
    sprite.anchor.setTo(0.5, 0.5);
    return sprite
}

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
        this.sound = game.add.audio(json.song);
        this.restart_off = 0;
        this.offset = json.offset;
        this.period = json.period;
        this.t = 0;
        this.prevt = 0;
        this.loaded = true;
        this.inside = json.inside;
        this.outside = json.outside;
        this.base = json.base;
    },

    update: function(){
        this.prevt = this.t;
        if(this.loaded){
            this.t = this.sound.currentTime + this.restart_off;
        }
        if(this.prevt >= this.t){
            this.t += game.time.physicsElapsed;
        }
        if(!this.sound.isPlaying){
            stage.tear();
            mainMenu();
        }
    },

    destroy: function(){
        this.sound.destroy();
    }
}

var BeatList = {
    init: function(json){
        this.beatlist = json.beatlist;
        this.beats = [];
        this.pos = 0;
    },
    makebeat: function(beatdata){
        var color = music.inside;
        if(beatdata[1] == 1 || beatdata[1] == 3){
            color = music.outside;
        }
        var beat = makerect(game.world.centerX, 100, 32, 16, color);
        //game.add.sprite(game.world.centerX, 100, "drop");
        //game.add.sprite(game.world.centerX, 100, 'emoji');
        beat.frame = 0;
        beat.inputEnabled = true;
        beat.anchor.setTo(0.5, 1.0);
        beat.timing = beatdata[0];
        beat.lane = beatdata[1];


        beat.x = (widths/6) + beat.lane*(widths/6);
        beat.erased = false;
        beat.hold = -1;

        if(beatdata[2] == 69){
            beat.hold = music.period;
        }
        return beat;

    },
    queuebeat: function(){
        var beatlistlength = this.beatlist.length;

        while(this.pos != beatlistlength && this.beatlist[this.pos][0] - music.t <= 4000){
            var beat = this.makebeat(this.beatlist[this.pos]);
            this.beats.push(beat);
            this.pos += 1;
        }
    },

    killall: function(){
        this.beats.forEach(function(e,i,a){
            e.kill();
        });
    },

    destroy: function(){
        this.beats.forEach(function(e,i,a){
            e.destroy();
        })
    },

    update: function(){
        var beatsnew = [];
        this.beats.forEach(function(e,i,a){
            //100(1 - 1/x)
            var foc = (e.timing - music.t)/judge.frame;
            e.y =  5*heights/6 * (1- foc);

            if(e.hold != -1){
                var extray = (heights*5/6) - ((e.timing - music.t - e.hold)/judge.frame * (heights*5/6));
                var boost = ( extray-e.y)/32.0;
                e.scale.setTo(1.0, boost);
            }

            if(music.t - e.timing >= 300){
                if(e.frame != 208 && e.frame != 46){
                    e.frame = 86;
                }
            }

            if(e.hold == -1 && (e.y >= heights || e.erased)){
                e.kill();
            }
            else if(e.hold != -1 && e.hold + (e.timing - music.t) < 0){
                e.kill();
            }
            else{
                beatsnew.push(e);
            }
        });
        if(this.beats.length >= 1){

            if(this.beats[0].lane == 1 || this.beats[0].lane == 3){
                if(stage.plank2.alpha < 0.8){
                    console.log("happening");
                    stage.plank2.alpha += 0.1;
                }
            }
            else{
                if(stage.plank2.alpha > 0.2){
                    stage.plank2.alpha -= 0.1;
                }
            }
        
        }

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
    },

    destroy: function(){
        this.lines.forEach(function(e,i,a){
            e.destroy();
        })
    },
}

var TapList = {
    init: function(){
        this.taps = [];
    },

    addtap: function(lane, glyph){
        var tap = game.add.sprite(game.world.centerX, 100, 'emoji');
        
        tap.anchor.setTo(0.5, 0.5);
        tap.x = (widths/6) + lane*(widths/6);
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
    },

    destroy: function(){
        this.taps.forEach(function(e,i,a){
            e.destroy();
        })
    },
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
    game.load.onLoadComplete.add(loadComplete, this);
    //game.load.onLoadComplete.add(loadComplete, this);

    game.load.audio('tear', 'assets/tearrain.mp3');
    game.load.audio('luv', 'assets/luv.mp3');
    //game.load.audio('shibayan', 'assets/shibayan.mp3');
    game.load.image('marisa', 'assets/marisa2.png');
    game.load.spritesheet('drop', 'assets/drop.png', 32, 32);
    game.load.spritesheet('flip', 'assets/flip.png');
    game.load.image('tewi', 'assets/tewi.png');
    game.load.image('load', 'assets/load.png');
    game.load.image('rem', 'assets/rem.png');
    game.load.image('line', 'assets/line.png');
    game.load.image('fall2', 'assets/fall2.png');
    game.load.spritesheet('emoji', 'assets/apple.png', 32, 32, 1681);
    game.load.text('tearsong', 'assets/song.json');
    game.load.text('luvsong', 'assets/songB.json');


    game.load.image('tearbg', 'assets/tear.png');
    game.load.image('luvbg', 'assets/luv.png');

    game.load.start();
}

function update(){
    stage.update();
}

function render(){
    if(beatlist.beats){
        beatlist.beats.forEach(function(e,i,a){
            if(e.hold != -1){
                game.debug.geom(e.line);
            }
        });

    }
}

var music = {};
var beatlist = {};
var linelist = {};
var taplist = {};

function loadComplete(){
    mainMenu();
}



function mainMenu(){
    
    var menu = {
        songlist: ['tear', 'luv'],
        spritelist: [
            game.add.button(0,0, "tearbg", function(){
                stage.tear();
                setStage('tearsong');
            }),
            game.add.button(320,0, "luvbg", function(){
                stage.tear();
                setStage('luvsong');
            }),
        ],
        swapbutton: game.add.button(0,400, "flip", function(){
            menu.swap();
        }),
        pos: 0,
        swap: function(){
            var buttonx = menu.spritelist[0].x;
            menu.spritelist[0].x = menu.spritelist[1].x;
            menu.spritelist[1].x = buttonx;
        }
    }

    menu.spritelist.forEach(function(e,i,a){
        e.onInputOver.add(function(){
            e.alpha -= 0.3;
        });
        e.onInputOut.add(function(){
            e.alpha += 0.3;
        });
    });

    stage.tear = function(){
        menu.spritelist.forEach(function(e,i,a){
            e.destroy();
        });
    }

}

function setStage(song){

    /* loads the stage */
    text.text = "Loaded";

    music = Object.create(Music);
    beatlist = Object.create(BeatList);
    //linelist = Object.create(LineList);
    taplist = Object.create(TapList);


    var json = JSON.parse(game.cache.getText(song));
    music.init(json);
    beatlist.init(json);
    judge.init(music.period * 2);
    //linelist.init();
    taplist.init();

    stage.back = makerect(widths/2, heights/2, widths, heights, music.base);
    stage.plank = makerect(widths/2, heights*11/12, widths, heights*1/6, music.inside);
    stage.plank2 = makerect(widths/2, heights*11/12, widths, heights*1/6, music.outside);

    music.sound.play();
    music.sound.volume = 0.2;

    key.h = game.input.keyboard.addKey(Phaser.Keyboard.H);
    key.n = game.input.keyboard.addKey(Phaser.Keyboard.N);
    key.j = game.input.keyboard.addKey(Phaser.Keyboard.J);
    key.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    key.k = game.input.keyboard.addKey(Phaser.Keyboard.K);
    key.h.onDown.add(eater.getKeyActivate('h'));
    key.n.onDown.add(eater.getKeyActivate('n'));
    key.j.onDown.add(eater.getKeyActivate('j'));
    key.m.onDown.add(eater.getKeyActivate('m'));
    key.k.onDown.add(eater.getKeyActivate('k'));

    key.h.onUp.add(eater.getKeyDeactivate('h'));
    key.n.onUp.add(eater.getKeyDeactivate('n'));
    key.j.onUp.add(eater.getKeyDeactivate('j'));
    key.m.onUp.add(eater.getKeyDeactivate('m'));
    key.k.onUp.add(eater.getKeyDeactivate('k'));

    if(debug){
        key.f = game.input.keyboard.addKey(Phaser.Keyboard.F);
        key.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
        key.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
        key.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
        key.f.onDown.add(eater.getKeyActivate('f'));
        key.a.onDown.add(eater.getKeyActivate('a'));
        key.s.onDown.add(eater.getKeyActivate('s'));
        key.d.onDown.add(eater.getKeyActivate('d'));
        game.input.onUp.add(mouseActivate, this);
        //game.input.onTap.add(mouseKeyActivate, this);
    }
    else{
        game.input.onTap.add(mouseKeyActivate, this);
    }

    stage.update = function(){
        music.update();

        if (music.sound.isDecoding){
            text.text = "Loading song";
            return;
        }
        else{
            text.text = "";
        }
        beatlist.queuebeat();
        beatlist.update();
        //linelist.update();
        taplist.update();
        eater.update();
    }

    stage.tear = function(){
        tearStage();
    }
}

function tearStage(){
    music.destroy();
    beatlist.destroy();
    //linelist.destroy();
    taplist.destroy();
    stage.update = function(){};
}

function mouseKeyActivate(tap){
    var lane = Math.round((tap.x-widths/6)/(widths/6));
    console.log(lane);
    if(lane == 0) eater.keyActivate('h');
    if(lane == 1) eater.keyActivate('n');
    if(lane == 2) eater.keyActivate('j');
    if(lane == 3) eater.keyActivate('m');
    if(lane == 4) eater.keyActivate('k');
}

function mouseActivate(key){
}

var eater = {
    held: {
        'h': null,
        'n': null,
        'j': null,
        'm': null,
        'k': null,
    },
    update: function(key){
        var helds = ['h','n','j','m','k'];
        for(var i=0; i<5; i++){

            if(eater.held[helds[i]]){
                taplist.addtap(eater.held[helds[i]].lane, eater.held[helds[i]].glyph);
            }
        }
    },
    getKeyActivate: function(key){
        return function(){
            eater.keyActivate(key);
        }
    },
    getKeyDeactivate: function(key){
        return function(){
            eater.keyDeactivate(key);
        }
    },
    keyActivate: function(key){
        if(key == 's' || key == 'd'){
            music.sound.pause();
            
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
            music.sound.volume = 0.2;
            music.restart_off = off;

            beatlist.pos = 0;
            while(beatlist.beatlist[beatlist.pos][0] < off-1000){
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
                music.sound.volume = 0.2;
            }
        }

        else if(key == 'f'){
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
                var keymapper = {'h':0, 'n':1, 'j': 2, 'm': 3, 'k': 4,};
                if(e.lane == keymapper[key]){
                    if(e.hold != -1){
                        eater.held[key] = e;
                        taplist.addtap(e.lane, e.glyph);
                    }
                    else if(gap < judge.perfectwindow){
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
                }
            }
        });
    },
    keyDeactivate: function(key){
        if(eater.held[key] !== null){
            var beat = eater.held[key];
            console.log("great job"+beat.hold);
            console.log(music.t - beat.timing);
            var gap = Math.abs(music.t - beat.timing - beat.hold);
            if(gap < judge.okwindow){
                taplist.addtap(beat.lane, beat.glyph);
            }
        }
        eater.held[key] = null;
    }

}

