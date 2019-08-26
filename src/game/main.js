game.module(
    'game.main'
)
.require(
    'plugin.p2'
)
.body(function() {  
	game.addAsset('player.png');
	game.addAsset('BackgroundTile.png');
	game.createScene('Main', {
		backgroundColor: '#272727',
		init: function() {
			var ths = this;
			this.world = new game.Physics({
				gravity: [0, 12],
			});
			this.world.on('beginContact', function(data) {
            // Before collision
            });
            this.world.on('impact', function(data) {
            // Collision
            });
            this.world.on('postStep', function(data) {
            // After collision
            });
			//Group
			this.groups = {
				PlayerGroup: Math.pow(2, 0),
				PlayerGroupFilter: Math.pow(2, 1),
				GROUND: Math.pow(2, 2),
			};
			this.container = new game.Container();
			this.container.addTo(this.stage);
			
            //Map     
			this.bg = new game.TilingSprite('BackgroundTile.png', game.width, game.height).addTo(this.container);
			new game.Wall_Platform(32, 96, 32, 672);
			new game.Wall_Platform(160, 384, 32, 224);
			new game.Wall_Platform(1247, 0, 64, 1023);
			new game.Slope_Solid_Platform(675, 310, 200, 32, 8.9);
			new game.Slope_Solid_Platform(619, 463, 365, 32, 9.6);
			new game.Slope_Solid_Platform(322, 392, 219, 32, 9.8);
			new game.Solid_Platform(32, 768, 352, 128);
			new game.Solid_Platform(864, 800, 96, 32);
			new game.Solid_Platform(992, 928, 128, 32);
			new game.Solid_Platform(1088, 736, 96, 32);
			new game.Solid_Platform(992, 928, 128, 32);
			new game.Solid_Platform(1088, 736, 96, 32);
			new game.Solid_Platform(480, 240, 96, 30);
			new game.Solid_Platform(528, 432, 96, 32);
			new game.Solid_Platform(192, 320, 96, 32);
			new game.Solid_Platform(0, -28, 1280, 28);
			new game.Solid_Platform(32, 768, 352, 128);
			new game.JumpThru_Platform(1056, 624, 160, 16);
			new game.JumpThru_Platform(1056, 528, 160, 16);
			new game.JumpThru_Platform(160, 224, 96, 16);
			new game.JumpThru_Platform(320, 160, 96, 16);
			new game.JumpThru_Platform(528, 128, 96, 16);
			new game.JumpThru_Platform(1056, 128, 96, 16);
			new game.MovingSolid_Platformer_Horizon(450, 800, 128, 32, 730, 2000);
			new game.MovingSolid_Platformer_Horizon(640, 160, 128, 32, 800, 2000);
			new game.MovingSolid_Platformer_Vertical(928, 417, 96, 16, 190, 2000);
			
            //How To Play
			new game.Dialogue(42, 790, '-Arrow keys or WASD to move');
			new game.Dialogue(42, 824, '-P key to pause the game');
			new game.Dialogue(42, 858, '-You can jump up across the brown walls');
			
            //Player
			this.player = new game.Player(128, 684);
			
            //Hide BackScreen
			this.blackscreen = new game.Graphics();
			this.blackscreen.fillColor = '#000000';
			this.blackscreen.alpha = 0;
			this.blackscreen.drawRect(0, 0, game.width, game.height);
			
            //Camera Follow Player
			this.camera = new game.Camera(this.player.sprite);
			this.camera.position.set(this.player.sprite.position.x,this.player.sprite.position.y);
			this.camera.limit.x = 0;
			this.camera.limit.y = 0;
			this.camera.limit.width = game.width;
			this.camera.limit.height = game.height;
			this.camera.acceleration = 20;
			this.camera.addTo(this.container);
			this.container.scale.x = 2;
			this.container.scale.y = 2;
		},
		keydown: function(key) {
			if (key === 'P' && this.player.sprite.onScreen()) {
				if (this.paused) {
					this.resume();
					this.blackscreen.remove();
				} else {
					this.pause();
					this.blackscreen.addTo(this.stage);
					this.blackscreen.alpha = 0.5;
				}
			}
		},
		update: function() {
			this.bg.x = this.camera.position.x * 0.4;
		}
	});
	game.createClass('Player', {
		classname: 'playerclass',
		speed: 3,
		alive: true,
		isOnGround: false,
		init: function(x, y) {
			var ths = this;
			this.sprite = new game.Sprite("player.png");
			this.sprite.position.set(x, y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 1,
				fixedRotation: true,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			this.shape = new p2.Box({
				width: this.sprite.width / game.scene.world.ratio,
				height: this.sprite.height / game.scene.world.ratio
			});
			this.shape.collisionGroup = game.scene.groups.PlayerGroup;
			this.shape.collisionMask = game.scene.groups.PlayerGroup | game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.PlayerBody;
			this.body.addTo(game.scene.world);
		},
		checkIfCanJump: function() {
			for (var i = 0; i < game.scene.world.narrowphase.contactEquations.length; i++) {
				var c = game.scene.world.narrowphase.contactEquations[i];
				if (c.bodyA === this.body || c.bodyB === this.body) {
					this.isOnGround = true;
					var d = c.normalA[1];
					if (c.bodyB === this.body) d *= -1;
					if (d > 0.5) {
						return true;
					}
				}
			}
			this.isOnGround = false;
			return false;
		},
		Onslope: function() {
			var ths = this;
			for (var i = 0; i < game.scene.world.narrowphase.contactEquations.length; i++) {
				var c = game.scene.world.narrowphase.contactEquations[i];
				if (game.scene.player.body.velocity[1] < 0 && ((c.bodyA === this.body && c.bodyB.collisionGroup === game.Body.SlopePlatformBody) || (c.bodyB === this.body && c.bodyA.collisionGroup === game.Body.SlopePlatformBody))) {
					this.body.mass = 0;
					this.body.velocity[1] = 0;
					var d = c.normalA[1];
					if (c.bodyB === this.body) d *= -1;
					if (d > 0.5) {
						return true;
					}
				}
			}
			this.body.mass = 1;
			return false;
		},
		OnWall: function() {
			var ths = this;
			for (var i = 0; i < game.scene.world.narrowphase.contactEquations.length; i++) {
				var c = game.scene.world.narrowphase.contactEquations[i];
				if ((c.bodyA === this.body && c.bodyB.collisionGroup === game.Body.WallBody) || (c.bodyB === this.body && c.bodyA.collisionGroup === game.Body.WallBody)) {
					if (game.scene.player.body.velocity[1] > 2 && game.keyboard.down('W')) {
						if (this.sprite.scale.x == -1) {
							this.body.position[0] = this.body.position[0] + 0.4;
						} else {
							this.body.position[0] = this.body.position[0] - 0.4;
						}
						this.body.velocity[1] = -7;
					}
					return true;
				}
			}
			return false;
		},
		play: function(anim) {
			if (this.sprite.currentAnim === this.sprite.anims[anim]) return;
			this.sprite.play(anim);
		},
		destroy: function() {
			game.scene.blackscreen.addTo(game.scene.stage);
			this.sprite.remove();
			this.body.remove();
			game.scene.removeObject(this)
			var tween1 = new game.Tween(game.scene.blackscreen);
			tween1.to({
				alpha: 1
			}, 1000);
			tween1.easing('Quadratic.InOut');
			tween1.start();
			tween1.onComplete(function() {
				game.system.loadScene('Main');
			});
		},
		update: function() {
			var ths = this;
			if (!this.sprite.onScreen()) {
				this.destroy();
			}
			if (this.checkIfCanJump() || game.scene.player.body.velocity[1] > 2) {
				if (game.keyboard.down('S')) {
					ths.shape.collisionGroup = game.scene.groups.PlayerGroupFilter;
				} else {
					ths.shape.collisionGroup = game.scene.groups.PlayerGroup;
				}
			} else if (game.scene.player.body.velocity[1] < 2) {
				ths.shape.collisionGroup = game.scene.groups.PlayerGroupFilter;
			}
			this.OnWall();
			this.sprite.position.x = this.body.position[0] * game.scene.world.ratio;
			this.sprite.position.y = this.body.position[1] * game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
			this.Onslope();
			if (game.keyboard.down('A')) {
				this.body.velocity[0] = -this.speed;
				this.sprite.scale.x = -1;
			} else if (game.keyboard.down('D')) {
				this.body.velocity[0] = this.speed;
				this.sprite.scale.x = 1;
			} else {
				this.body.velocity[0] = 0;
			}
			//Jump
			if (this.checkIfCanJump()) {
				if (game.keyboard.down('W')) {
					this.isonSlope = false;
					this.body.velocity[1] = -6;
				}
			}
		}
	});
	game.createClass('Wall_Platform', {
		init: function(x, y, width, height) {
			this.sprite = new game.Graphics();
			this.sprite.fillColor = '#895103';
			this.sprite.drawRect(0, 0, width, height);
			this.sprite.position.set(this.sprite.width / 2 + x, this.sprite.height / 2 + y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 0,
				fixedRotation: false,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			var ratio = game.scene.world.ratio;
			this.shape = new p2.Box({
				width: this.sprite.width / ratio,
				height: this.sprite.height / ratio
			});
			this.shape.collisionGroup = game.scene.groups.GROUND;
			this.shape.collisionMask = game.scene.groups.PlayerGroup | game.scene.groups.PlayerGroupFilter | game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.WallBody;
			this.body.addTo(game.scene.world);
		},
		update: function() {
			this.sprite.position.x = this.body.position[0] * game.scene.world.ratio;
			this.sprite.position.y = this.body.position[1] * game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
		}
	});
	game.createClass('Solid_Platform', {
		init: function(x, y, width, height) {
			this.sprite = new game.Graphics();
			this.sprite.fillColor = '#2a2a2a';
			this.sprite.drawRect(0, 0, width, height);
			this.sprite.position.set(this.sprite.width / 2 + x, this.sprite.height / 2 + y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 0,
				fixedRotation: false,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			var ratio = game.scene.world.ratio;
			this.shape = new p2.Box({
				width: this.sprite.width / ratio,
				height: this.sprite.height / ratio
			});
			this.shape.collisionGroup = game.scene.groups.GROUND;
			this.shape.collisionMask = game.scene.groups.PlayerGroup | game.scene.groups.PlayerGroupFilter | game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.PlatformBody;
			this.body.addTo(game.scene.world);
		},
		update: function() {
			this.sprite.position.x = this.body.position[0] * game.scene.world.ratio;
			this.sprite.position.y = this.body.position[1] * game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
		}
	});
	game.createClass('JumpThru_Platform', {
		init: function(x, y, width, height) {
			this.sprite = new game.Graphics();
			this.sprite.fillColor = 'blue';
			this.sprite.drawRect(0, 0, width, height);
			this.sprite.position.set(this.sprite.width / 2 + x, this.sprite.height / 2 + y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 0,
				fixedRotation: false,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			var ratio = game.scene.world.ratio;
			this.shape = new p2.Box({
				width: this.sprite.width / ratio,
				height: this.sprite.height / ratio
			});
			this.shape.collisionGroup = game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.PlatformBody;
			this.body.addTo(game.scene.world);
		},
		update: function() {
			this.sprite.position.x = this.body.position[0] * game.scene.world.ratio;
			this.sprite.position.y = this.body.position[1] * game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
		}
	});
	game.createClass('Slope_Solid_Platform', {
		init: function(x, y, width, height, angle) {
			this.sprite = new game.Graphics();
			this.sprite.fillColor = '#860000';
			this.sprite.drawRect(0, 0, width, height);
			this.sprite.position.set(this.sprite.width / 2 + x, this.sprite.height / 2 + y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 0,
				angle: angle,
				fixedRotation: false,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			var ratio = game.scene.world.ratio;
			this.shape = new p2.Box({
				width: this.sprite.width / ratio,
				height: this.sprite.height / ratio
			});
			this.shape.collisionGroup = game.scene.groups.GROUND;
			this.shape.collisionMask = game.scene.groups.PlayerGroup | game.scene.groups.PlayerGroupFilter | game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.SlopePlatformBody;
			this.body.addTo(game.scene.world);
		},
		update: function() {
			this.sprite.position.x = this.body.position[0] * game.scene.world.ratio;
			this.sprite.position.y = this.body.position[1] * game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
		}
	});
	game.createClass('MovingSolid_Platformer_Horizon', {
		init: function(x, y, width, height, hx, speed) {
			this.speed = speed;
			this.sprite = new game.Graphics();
			this.sprite.fillColor = '#2a2a2a';
			this.sprite.drawRect(0, 0, width, height);
			this.sprite.position.set(this.sprite.width / 2 + x, this.sprite.height / 2 + y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 0,
				fixedRotation: false,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			var ratio = game.scene.world.ratio;
			this.shape = new p2.Box({
				width: this.sprite.width / ratio,
				height: this.sprite.height / ratio
			});
			this.shape.collisionGroup = game.scene.groups.GROUND;
			this.shape.collisionMask = game.scene.groups.PlayerGroup | game.scene.groups.PlayerGroupFilter | game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.Float_PLATFORM_HORIZON;
			this.body.collideAgainst = [game.Body.PLAYER];
			this.body.addTo(game.scene.world);
			game.Tween.add(this.sprite.position, {
				x: hx
			}, speed, {
				repeat: Infinity,
				yoyo: true
			}).start();
		},
		collidePlayer: function() {
			for (var i = 0; i < game.scene.world.narrowphase.contactEquations.length; i++) {
				var c = game.scene.world.narrowphase.contactEquations[i];
				if ((c.bodyA === this.body && c.bodyB.collisionGroup === game.Body.PlayerBody) || (c.bodyB === this.body && c.bodyA.collisionGroup === game.Body.PlayerBody)) {
					return true;
				}
			}
			return false;
		},
		update: function() {
			if (this.collidePlayer()) {
				game.scene.player.body.position[0] -= (this.body.position[0] - (this.sprite.position.x / game.scene.world.ratio));
			}
			this.body.position[0] = this.sprite.position.x / game.scene.world.ratio;
			this.body.position[1] = this.sprite.position.y / game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
		}
	});
	game.createClass('MovingSolid_Platformer_Vertical', {
		init: function(x, y, width, height, vy, speed) {
			this.speed = speed;
			this.sprite = new game.Graphics();
			this.sprite.fillColor = '#2a2a2a';
			this.sprite.drawRect(0, 0, width, height);
			this.sprite.position.set(this.sprite.width / 2 + x, this.sprite.height / 2 + y);
			this.sprite.anchorCenter();
			this.sprite.addTo(game.scene.container);
			this.body = new game.Body({
				mass: 0,
				fixedRotation: false,
				position: [
					this.sprite.position.x / game.scene.world.ratio,
					this.sprite.position.y / game.scene.world.ratio
				],
			});
			var ratio = game.scene.world.ratio;
			this.shape = new p2.Box({
				width: this.sprite.width / ratio,
				height: this.sprite.height / ratio
			});
			this.shape.collisionGroup = game.scene.groups.GROUND;
			this.shape.collisionMask = game.scene.groups.PlayerGroup | game.scene.groups.PlayerGroupFilter | game.scene.groups.GROUND;
			this.body.addShape(this.shape);
			this.body.collisionGroup = game.Body.Float_PLATFORM_VERTICAL;
			this.body.collideAgainst = [game.Body.PLAYER];
			this.body.addTo(game.scene.world);
			game.Tween.add(this.sprite.position, {
				y: vy
			}, speed, {
				repeat: Infinity,
				yoyo: true
			}).start();
		},
		collidePlayer: function() {
			for (var i = 0; i < game.scene.world.narrowphase.contactEquations.length; i++) {
				var c = game.scene.world.narrowphase.contactEquations[i];
				if ((c.bodyA === this.body && c.bodyB.collisionGroup === game.Body.PlayerBody) || (c.bodyB === this.body && c.bodyA.collisionGroup === game.Body.PlayerBody)) {
					return true;
				}
			}
			return false;
		},
		update: function() {
			if (this.collidePlayer()) {
				game.scene.player.body.position[1] -= (this.body.position[1] - (this.sprite.position.y / game.scene.world.ratio));
			}
			this.body.position[0] = this.sprite.position.x / game.scene.world.ratio;
			this.body.position[1] = this.sprite.position.y / game.scene.world.ratio;
			this.sprite.rotation = this.body.angle;
		}
	});
	game.createClass('Dialogue', {
		init: function(x, y, txt) {
			this.text = new game.SystemText(txt);
			this.text.size = 18;
			this.text.color = '#fdfdfd';
			this.text.position.set(x, y);
			this.text.addTo(game.scene.container);
		}
	});
	// Attributes for different body types
	game.addAttributes('Body', {
		PlayerBody: 0,
		PlayerAttackBody: 1,
		PlatformBody: 2,
		SlopePlatformBody: 3,
		WallBody: 4
	});
});