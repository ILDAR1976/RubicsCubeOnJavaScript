sbVertexShader = [
"varying vec3 vWorldPosition;",
"void main() {",
"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
"  vWorldPosition = worldPosition.xyz;",
"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
"}",
].join("\n");

sbFragmentShader = [
"uniform vec3 topColor;",
"uniform vec3 bottomColor;",
"uniform float offset;",
"uniform float exponent;",
"varying vec3 vWorldPosition;",
"void main() {",
"  float h = normalize( vWorldPosition + offset ).y;",
"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
"}",
].join("\n");

'use strict';

//The assambling variables

const CrossStatusEnum = {
	CrossIsNotComplited: 1,
	CrossIsSetup: 2,
	CrossIsComplited:3
}

const ThreeColorBlockThirdLayerStatusEnum = {
	BlockIsNotComplited:1,
	BlockIsSetup:2,
	BlockIsComplited:3
}

const ModeStatusEnum = { 
	Idle: 0, 
	InitFindMainBlockFirstLayer: 1,
	FindMainBlockFirstLayer: 2, 
	MoveMainBlockFirstLayer: 3, 
	InitFourTwoColorBlockFirstLayer: 4,
	FindFourTwoColorBlockFirstLayer: 5,
	MoveFourTwoColorBlockFirstLayer:6,
	MovePerTemplateTwoColorBlockFirstLayer:7,
	RecaliblrateCrossForFirstLayer:8,
	InitFourThreeColorBlockFirstLayer:9,
	FindFourThreeColorBlockFirstLayer:11,
	MoveFourThreeColorBlockFirstLayer:12,
	MovePerTemplateThreeColorBlockFirstLayer:13,
	InitFourTwoColorBlockSecondLayer:14,
	FindFourTwoColorBlockSecondLayer:15,
	MoveFourTwoColorBlockSecondLayer:16,
	MovePerTemplateTwoColorBlockSecondLayer:17,
	InitFourTwoColorBlockThirdLayer:18,
	FindFourTwoColorBlockThirdLayer:19,
	MoveFourTwoColorBlockThirdLayer:20,
	TurnRoundFourTwoColorBlockThirdLayer:21,
	MovePerTemplateTwoColorBlockThirdLayer:22,
	InitFourThreeColorBlockThirdLayer:23,
	FindFourThreeColorBlockThirdLayer:24,
	FindAnchorThirdLayer:25,
	MoveFourThreeColorBlockThirdLayer:26,
	TurnRoundFourThreeColorBlockThirdLayer:27,
	MovePerTemplateThreeColorBlockThirdLayer:28,
	TurnRoundPerTemplateThreeColorBlockThirdLayer:29,
	RecaliblrateCrossForThirdLayer:30
};

var CrossStatus = CrossStatusEnum.CrossIsNotComplited;
var TransportMatrix = [];
var ListTarget = [];
var TargetIndex = 0;
var TargetBlock;
var CurrentBlock;
var ModeStatus = ModeStatusEnum.Idle;
var MoveTemplate;
var TryCounter = 0;
var AnchorIsShift = false;


var DecisionMatrixForThreeColorFirstLayer = new Map([

// layer 3
	
	['c3c3c3t3t3', [-4,3,4,-3]],
	['c3c1c3t3t3', [3,4,-3]],
	['c1c1c3t3t3', [-1,3,4,-3,1]],
	['c1c3c3t3t3', [-4,-4,3,4,-3]],

	['c3c3c3t3t1', [1,-4,-1]],
	['c3c1c3t3t1', [4,1,-4,-1]],
	['c1c1c3t3t1', [4,4,1,-4,-1]],
	['c1c3c3t3t1', [1,-4,-4,-1]],

	['c3c3c3t1t1', [-1,-4,-4,1]],
	['c3c1c3t1t1', [4,-1,-4,-4,1]],
	['c1c1c3t1t1', [-4,-1,4,1]],
	['c1c3c3t1t1', [-1,4,1]],

	['c3c3c3t1t3', [-4,-3,4,4,3]],
	['c3c1c3t1t3', [-3,4,4,3]],
	['c1c1c3t1t3', [-3,-4,3]],
	['c1c3c3t1t3', [4,-3,-4,3]],  

// layer 1

	['c3c1c1t3t3', [1,3,4,-3,-1]],
	['c1c1c1t3t3', [-1,3,-4,-4,1,-3]],
	['c1c3c1t3t3', [-7,-9,-4,9,7]],

	['c3c3c1t3t1', [3,1,-4,-1,-3]],
	['c1c1c1t3t1', [7,9,4,-9,-7]],
	['c1c3c1t3t1', [-7,1,-4,-4,-1,7]],

	['c3c3c1t1t1', [3,7,-4,-4,-7,-3]],
	['c3c1c1t1t1', [7,9,-4,-7,-9]],
	['c1c3c1t1t1', [-3,-1,4,3,1]],

	['c3c3c1t1t3', [-7,-9,4,7,9]],
	['c3c1c1t1t3', [-7,1,4,4,-1,7]],
	['c1c1c1t1t3', [-3,-1,-4,3,1]],

// Rotate on layer 1

	['k1k4k6t3t3r', [-3,9,3,-9,-3,9,3,-9]],
	['k6k1k4t3t3r', [9,-3,-9,3,9,-3,-9,3]],

	['k5k1k4t3t1r', [-9,-1,9,1,-9,-1,9,1]],
	['k1k4k5t3t1r', [-1,-9,1,9,-1,-9,1,9]],

	['k1k3k5t1t1r', [1,-7,-1,7,1,-7,-1,7]],
	['k5k1k3t1t1r', [-7,1,7,-1,-7,1,7,-1]],

	['k1k3k6t1t3r', [3,7,-3,-7,3,7,-3,-7]],
	['k6k1k3t1t3r', [7,3,-7,-3,7,3,-7,-3]]
]);  
var DecisionMatrixForTwoColorSecondLayer = new Map([
//layer 2	
	['c3c3c2s', [3,4,-3,4,-9,-4,9]],
	['c3c1c2s', [9,4,-9,4,1,-4,-1]],
	['c1c1c2s', [-1,4,1,4,7,-4,-7]],
	['c1c3c2s', [-7,4,7,4,-3,-4,3]],

//layer 3
	// Right position
    ['k0k6k4c2c3c3t3t3', [4,-9,-4,9,-4,3,4,-3]],
	['k6k0k4c1c2c3t3t3', [-9,-4,9,-4,3,4,-3]],
	['k0k6k4c2c1c3t3t3', [-4,-9,-4,9,-4,3,4,-3]],
	['k6k0k4c3c2c3t3t3', [-4,-4,-9,-4,9,-4,3,4,-3]],

	// Revers position
    ['k0k4k6c2c3c3t3t3', [-4,-4,3,4,-3,4,-9,-4,9]],
	['k4k0k6c1c2c3t3t3', [4,3,4,-3,4,-9,-4,9]],
	['k0k4k6c2c1c3t3t3', [3,4,-3,4,-9,-4,9]],
	['k4k0k6c3c2c3t3t3', [-4,3,4,-3,4,-9,-4,9]],
	
	// Right position
	['k0k3k6c2c3c3t1t3', [-4,-4,-3,-4,3,-4,-7,4,7]],
	['k3k0k6c1c2c3t1t3', [-3,-4,3,-4,-7,4,7]],
	['k0k3k6c2c1c3t1t3', [4,-3,-4,3,-4,-7,4,7]],
	['k3k0k6c3c2c3t1t3', [4,4,-3,-4,3,-4,-7,4,7]],

	// Revers position
	['k0k6k3c2c3c3t1t3', [-4,-7,4,7,4,-3,-4,3]],
	['k6k0k3c1c2c3t1t3', [4,-7,4,7,4,-3,-4,3]],
	['k0k6k3c2c1c3t1t3', [-7,4,7,4,-3,-4,3]],
	['k6k0k3c3c2c3t1t3', [-4,-7,4,7,4,-3,-4,3]],

	// Right position
	['k0k4k5c2c3c3t3t1', [1,-4,-1,-4,9,4,-9]],
	['k4k0k5c1c2c3t3t1', [4,1,-4,-1,-4,9,4,-9]],
	['k0k4k5c2c1c3t3t1', [4,4,1,-4,-1,-4,9,4,-9]],
	['k4k0k5c3c2c3t3t1', [-4,1,-4,-1,-4,9,4,-9]],

	// Revers position
	['k0k5k4c2c3c3t3t1', [-4,9,4,-9,4,1,-4,-1]],
	['k5k0k4c1c2c3t3t1', [9,4,-9,4,1,-4,-1]],
	['k0k5k4c2c1c3t3t1', [4,9,4,-9,4,1,-4,-1]],
	['k5k0k4c3c2c3t3t1', [4,4,9,4,-9,4,1,-4,-1]],


	// Right position
	['k0k5k3c2c3c3t1t1', [-4,7,-4,-7,-4,-1,4,1]],
	['k5k0k3c1c2c3t1t1', [-4,-4,7,-4,-7,-4,-1,4,1]],
	['k0k5k3c2c1c3t1t1', [4,7,-4,-7,-4,-1,4,1]],
	['k5k0k3c3c2c3t1t1', [7,-4,-7,-4,-1,4,1]],

	// Revers position
	['k0k3k5c2c3c3t1t1', [4,-1,4,1,4,7,-4,-7]],
	['k3k0k5c1c2c3t1t1', [4,4,-1,4,1,4,7,-4,-7]],
	['k0k3k5c2c1c3t1t1', [-4,-1,4,1,4,7,-4,-7]],
	['k3k0k5c3c2c3t1t1', [-1,4,1,4,7,-4,-7]]

	

]);  
var DecisionMatrixForTwoColorThirdLayer = new Map([
	['c3c2', [4,-9,1,4,-1,-4,9]],	
	['c2c3', [4,-3,-9,4,9,-4,3]],
	['c1c2', [4,7,-3,4,3,-4,-7]],
	['c2c1', [4,1,7,4,-7,-4,-1]],
	
	['tb302', [1]],
	['tb402', [1]],
	['tb502', [1]],
	['tb602', [1]],
	['tb032', [1]],
	['tb042', [1]],
	['tb052', [1]],
	['tb062', [1]]
	
	
]);	
var DecisionMatrixForThreeColorThirdLayer = new Map([
	['tb352', ['g0']],
	['tb532', ['g0']],
	['tb235', ['g1']],
	['tb325', ['g1']],
	['tb523', ['g2']],
	['tb253', ['g2']],

	['tb462', ['g0']],
	['tb642', ['g0']],
	['tb246', ['g1']],
	['tb426', ['g1']],
	['tb624', ['g2']],
	['tb264', ['g2']],

	['tb542', ['g0']],
	['tb452', ['g0']],
	['tb254', ['g1']],
	['tb524', ['g1']],
	['tb425', ['g2']],
	['tb245', ['g2']],	

	['tb632', ['g0']],
	['tb362', ['g0']],
	['tb263', ['g1']],
	['tb623', ['g1']],
	['tb426', ['g2']],
	['tb246', ['g2']],	

	['g1',[-7,-3,7,3,-7,-3,7,3]],
	['g2',[-3,-7,3,7,-3,-7,3,7]],

	['rc11',[3,-7,-3,9,3,7,-3,-9]], //brown
	['rc13',[9,3,-9,-1,9,-3,-9,1]], //green
	['rc33',[-1,9,1,-7,-1,-9,1,7]], //yellow
	['rc31',[-7,-1,7,3,-7,1,7,-3]]  //blue

]);

var Break = false;
var Tact = 0;

var SingleColorBlocks = [
	[1,2,2],
    [1,2,3],
	[2,1,2],
	[2,2,1],
    [2,2,3],
	[3,2,2]
];

var TwoColorBlocks = [
	[2,1,1],
    [1,2,1],
    [3,2,1],
    [2,3,1],
    [2,1,2],
    [1,2,2],
    [3,2,2],
    [2,3,2],
    [2,1,3],
    [1,2,3],
    [3,2,3],
    [2,3,3]
];

var ThreeColorBlocks = [
	[1,1,1],
	[1,3,1],
	[3,1,1],
	[3,3,1],
	[1,1,3],
	[1,3,3],
	[3,1,3],
	[3,3,3]
];

var MoveToCode = [
	[ 1,2,3],
	[ 4,5,6],
	[ 7,8,9]
];	


class Block
{
	
	constructor(x, y, z, cx = 0, cy = 0, cz = 0)
	{
		this.b = new Array(7);
		this.b[0] = 0;
		this.b[1] = x;
		this.b[2] = y;
		this.b[3] = z;
		this.b[4] = cx;
		this.b[5] = cy;
		this.b[6] = cz;
	}
}

class Cube3DMatrix
{
	
	constructor()
	{
		this.Matrix = [];
		this.inicialize();
	}
	
	inicialize()
	{
		for (var i = 0; i < 4; i++)
		{
			this.Matrix[i] = [];
			for (var j = 0; j < 4; j++)
			{
				this.Matrix[i][j] = [];
				for (var k = 0; k < 4; k++)
				{
					this.Matrix[i][j][k] = new Block(0, 0, 0);
				}
			}
		}

		for (var i = 1; i < 4; i++)
		{
			for (var j = 1; j < 4; j++)
			{
				for (var k = 1; k < 4; k++)
				{
					if ((i > 0) && (j > 0) && (k > 0))
					{
						switch (i)
						{
							case 1:
								this.Matrix[i][j][k].b[1] = 3;
								break;
							case 2:
								this.Matrix[i][j][k].b[1] = 0;
								break;
							case 3:
								this.Matrix[i][j][k].b[1] = 4;
								break;
						}

						switch (j)
						{
							case 1:
								this.Matrix[i][j][k].b[2] = 5;
								break;
							case 2:
								this.Matrix[i][j][k].b[2] = 0;
								break;
							case 3:
								this.Matrix[i][j][k].b[2] = 6;
								break;
						}

						switch (k)
						{
							case 1:
								this.Matrix[i][j][k].b[3] = 1;
								break;
							case 2:
								this.Matrix[i][j][k].b[3] = 0;
								break;
							case 3:
								this.Matrix[i][j][k].b[3] = 2;
								break;
						}

					}
				}
			}
		}
	}
}

class CubeMatrix
	{
		constructor()
		{
			this.Cube3D = new Cube3DMatrix();
			this.CutedBlock = [];
			this.InitMatrix4x4(this.CutedBlock);
			this.cm = [];
			this.BufferPlane = [];
			this.InitMatrix4x4(this.BufferPlane);
			this.inicialize();
		}

		Transform(Plane, f)
		{
			var a = 0;
			var b = 0;
			var Rotate = [];
			var Buffer = [[ 0, 0, 0],
						  [ 0, 0, 0],
			              [ 0, 0, 0]];
			switch (f * f)
			{
				case 1:
					Rotate = [[ 0,-1],
							  [ 1, 0]];
					break;
				case 4:
					Rotate = [[ 0, 1],
							  [-1, 0]];
					break;
				case 9:
					Rotate = [[-1, 0],
							   [0, 1]];
					break;
				case 16:
					Rotate = [[ 1, 0],
							 [ 0,-1]];
					break;
			}

			if (f < 0)
			{
				a = 3;
				b = -1;
			}
			else
			{
				a = -1;
				b = 3;
			}

			this.CopyPlate(Plane, Buffer);
			Plane[Rotate[0][0] + Rotate[0][1]+a][Rotate[1][0] + Rotate[1][1]+b] = Buffer[0][0];
			Plane[Rotate[0][0] + Rotate[0][1]*2+a][Rotate[1][0] + Rotate[1][1]*2+b] = Buffer[0][1];
			Plane[Rotate[0][0] + Rotate[0][1]*3+a][Rotate[1][0] + Rotate[1][1]*3+b] = Buffer[0][2];
			
			Plane[Rotate[0][0]*2 + Rotate[0][1]+a][Rotate[1][0]*2 + Rotate[1][1]+b] = Buffer[1][0];
			Plane[Rotate[0][0]*2 + Rotate[0][1]*2+a][Rotate[1][0]*2 + Rotate[1][1]*2+b] = Buffer[1][1];
			Plane[Rotate[0][0]*2 + Rotate[0][1]*3+a][Rotate[1][0]*2 + Rotate[1][1]*3+b] = Buffer[1][2];
			
			Plane[Rotate[0][0]*3 + Rotate[0][1]+a][Rotate[1][0]*3 + Rotate[1][1]+b] = Buffer[2][0];
			Plane[Rotate[0][0]*3 + Rotate[0][1]*2+a][Rotate[1][0]*3 + Rotate[1][1]*2+b] = Buffer[2][1];
			Plane[Rotate[0][0]*3 + Rotate[0][1]*3+a][Rotate[1][0]*3 + Rotate[1][1]*3+b] = Buffer[2][2];
		}
		CopyPlate(a, b)
		{
			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					b[i][j] = a[i][j];
		}

		Copy(a, b)
		{
			for (var i = 0; i < 4; i++)
				for (var j = 0; j < 4; j++)
				{
					b[i][j] = a[i][j];
				}
		}
		LeftRotatePlane(Plane, BufferPlane, cm)
		{
			var Rotate = [ [0,-1],
					 	   [1, 0]];
			var aa = 0;
			var bb = 0;
			this.Copy(Plane, BufferPlane);
			for (var i = 1; i < 4; i++)
			{
				for (var j = 1; j < 4; j++)
				{
					if (cm[0] != 0) {
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j] = BufferPlane[i][j]; 
						aa = Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[2];
						bb = Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[3];
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[2] = bb;
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[3] = aa;
					};
	
					if (cm[1] != 0) {
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j] = BufferPlane[i][j]; 
						aa = Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[1];
						bb = Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[3];
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[1] = bb;
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[3] = aa;
					};
	
					if (cm[2] != 0) {
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j] = BufferPlane[i][j]; 
						aa = Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[1];
						bb = Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[2];
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[1] = bb;
						Plane[Rotate[0][0]*i + Rotate[0][1]*j+4][Rotate[1][0]*i + Rotate[1][1]*j].b[2] = aa;
					};
				}
			}

		}
		
		RightRotatePlane(Plane, BufferPlane, cm)
		{
			var Rotate = [ [ 0, 1],
					       [-1, 0]];
			var aa = 0;
			var bb = 0;
			//Print2(Plane);

			this.Copy(Plane, BufferPlane);
			for (var i = 1; i < 4; i++)
			{
				for (var j = 1; j < 4; j++)
				{
					if (cm[0] != 0) {
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4] = BufferPlane[i][j]; 
						aa = Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[2];
						bb = Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[3];
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[2] = bb;
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[3] = aa;
					}
	
					if (cm[1] != 0) {
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4] = BufferPlane[i][j]; 
						aa = Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[1];
						bb = Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[3];
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[1] = bb;
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[3] = aa;
					}
	
					if (cm[2] != 0) {
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4] = BufferPlane[i][j]; 
						aa = Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[1];
						bb = Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[2];
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[1] = bb;
						Plane[Rotate[0][0]*i + Rotate[0][1]*j][Rotate[1][0]*i + Rotate[1][1]*j+4].b[2] = aa;
					}
				}
			}
			//Print2(Plane);
		}
		
		CutSwapLayer(a, b, cm, f)
		{
			for (var i = 0; i < 4; i++)
				for (var j = 0; j < 4; j++)
					for (var k = 0; k < 4; k++)
					{
						if ((i > 0) && (j > 0) && (k > 0))
						{
							if ((cm[2] * cm[2] == 1) && (k == 1))
								if (f == 0) b[i][j] = a[i][j][k]; else a[i][j][k] = b[i][j];
							if ((cm[2] * cm[2] == 4) && (k == 2))
								if (f == 0) b[i][j] = a[i][j][k]; else a[i][j][k] = b[i][j];
							if ((cm[2] * cm[2] == 9) && (k == 3))
								if (f == 0) b[i][j] = a[i][j][k]; else a[i][j][k] = b[i][j];

							if ((cm[0] * cm[0] == 1) && (i == 1))
								if (f == 0) b[j][k] = a[i][j][k]; else a[i][j][k] = b[j][k];
							if ((cm[0] * cm[0] == 4) && (i == 2))
								if (f == 0) b[j][k] = a[i][j][k]; else a[i][j][k] = b[j][k];
							if ((cm[0] * cm[0] == 9) && (i == 3))
								if (f == 0) b[j][k] = a[i][j][k]; else a[i][j][k] = b[j][k];

							if ((cm[1] * cm[1] == 1) && (j == 1))
								if (f == 0) b[i][k] = a[i][j][k]; else a[i][j][k] = b[i][k];
							if ((cm[1] * cm[1] == 4) && (j == 2))
								if (f == 0) b[i][k] = a[i][j][k]; else a[i][j][k] = b[i][k];
							if ((cm[1] * cm[1] == 9) && (j == 3))
								if (f == 0) b[i][k] = a[i][j][k]; else a[i][j][k] = b[i][k];
						}
					}
			//Print2(b);	
		}
		
		Rotate(icm)
		{
			this.CutSwapLayer(this.Cube3D.Matrix, this.CutedBlock, icm, 0);

			if ((icm[0] < 0) || (icm[1] < 0) || (icm[2] < 0))
				this.LeftRotatePlane(this.CutedBlock, this.BufferPlane, icm);
			else
				this.RightRotatePlane(this.CutedBlock, this.BufferPlane, icm);

			this.CutSwapLayer(this.Cube3D.Matrix, this.CutedBlock, icm, 1);

		}
		
		fullmatrix(plane, Color)
		{
			for (var i = 0; i < 3; i++){
				plane[i] = [];
				for (var j = 0; j < 3; j++)
					plane[i][j] = Color;
			}		
		}
		
		InitMatrix4x4(plane)
		{
			for (var i = 0; i < 4; i++) {
				plane[i] = [];
				for (var j = 0; j < 4; j++)
					plane[i][j] = new Block(0, 0, 0);
			}
		}

		inicialize()
		{
			this.RotateMatrix = [];
			this.InitMatrix4x4(this.RotateMatrix);
			this.plane1 = [];
			this.fullmatrix(this.plane1, 0);
			this.plane2 = [];
			this.fullmatrix(this.plane2, 0);
			this.plane3 = [];
			this.fullmatrix(this.plane3, 0);
			this.plane4 = [];
			this.fullmatrix(this.plane4, 0);
			this.plane5 = [];
			this.fullmatrix(this.plane5, 0);
			this.plane6 = [];
			this.fullmatrix(this.plane6, 0);
		}

		GetTransportMatrix() {
			this.ProektCube3D(this.Cube3D.Matrix);

			for (var i = 0; i < 18; i++) {
				TransportMatrix[i] = [];
				for (var j = 0; j < 3; j++)
					TransportMatrix[i][j] = 0;
			}

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					TransportMatrix[i][j] = this.plane1[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					TransportMatrix[i + 3][j] = this.plane2[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					TransportMatrix[i + 6][j] = this.plane3[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					TransportMatrix[i + 9][j] = this.plane4[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					TransportMatrix[i + 12][j] = this.plane5[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					TransportMatrix[i + 15][j] = this.plane6[i][j];			
		}

		PrintCube()
		{
			this.out = "";
			var VeiwMatrix = [];

			this.ProektCube3D(this.Cube3D.Matrix);

			for (var i = 0; i < 12; i++) {
				VeiwMatrix[i] = [];
				for (var j = 0; j < 9; j++)
					VeiwMatrix[i][j] = 0;
			}

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					VeiwMatrix[i][j + 3] = this.plane1[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					VeiwMatrix[i + 3][j] = this.plane2[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					VeiwMatrix[i + 3][j + 3] = this.plane3[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					VeiwMatrix[i + 3][j + 6] = this.plane4[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					VeiwMatrix[i + 6][j + 3] = this.plane5[i][j];

			for (var i = 0; i < 3; i++)
				for (var j = 0; j < 3; j++)
					VeiwMatrix[i + 9][j + 3] = this.plane6[i][j];

			for (var i = 0; i < 12; i++)
			{
				for (var j = 0; j < 9; j++) {
					if (j % 3 == 0 ) this.out += " ";
					switch (VeiwMatrix[i][j])
					{
						case 0:
							this.out += " ";
							break;
						default:
							this.out += VeiwMatrix[i][j];
							break;
					};
					
				}
					this.out += "\n";
					if ((i + 1) % 3 == 0 && i != 0 ) this.out += "\n";
			}
			console.log(this.out);
		}
		
		ProektCube3D(aa)
		{
			for (var i = 0; i < 4; i++)
				for (var j = 0; j < 4; j++)
					for (var k = 0; k < 4; k++)
					{
						if ((i == 1) && (k > 0) && (j > 0))
						this.plane1[j - 1][k - 1] = aa[i][j][k].b[1];
						if ((i == 3) && (k > 0) && (j > 0))
						this.plane5[j - 1][k - 1] = aa[i][j][k].b[1];

						if ((j == 1) && (k > 0) && (i > 0))
						this.plane2[i - 1][k - 1] = aa[i][j][k].b[2];
						if ((j == 3) && (k > 0) && (i > 0))
						this.plane4[i - 1][k - 1] = aa[i][j][k].b[2];

						if ((k == 1) && (i > 0) && (j > 0))
						this.plane3[i - 1][j - 1] = aa[i][j][k].b[3];
						if ((k == 3) && (i > 0) && (j > 0))
						this.plane6[i - 1][j - 1] = aa[i][j][k].b[3];
					}
					this.Transform(this.plane1, -1);
					this.Transform(this.plane2, 4);

					this.Transform(this.plane5, 4);
					this.Transform(this.plane5, -1);

					this.Transform(this.plane6, -3);
		}
		
		Print2(plane)
		{
			for (var i = 0; i < 4; i++)
			{
				for (var j = 0; j < 4; j++)
				{
					if ((i > 0) && (j > 0))
						this.out = (i + "-" + j + "(" + plane[i][j].b[1] + "-" + plane[i][j].b[2] + "-" + plane[i][j].b[3] + ")" + " ");

				}
				this.out += "\n";
			}
		}
		
		Print(A)
		{
			for (var i = 1; i < 4; i++)
			{
				for (var j = 1; j < 4; j++)
				{
					for (var k = 1; k < 4; k++)
					{
						this.out += ("x" + i + "y" + j + "z" + k +
										  "(" + A[i][j][k].b[1] + " " +
												A[i][j][k].b[2] + " " +
												A[i][j][k].b[3] + ") ");
					}
					this.out += "\n";
				}
				this.out += "\n";
			}
		}
}


var mouse = new THREE.Vector2();
var axis;
var rad;
var mouseIsDown = false;

var perc1=0.9;
var perc2=0.9;
var perc3=0.9;

var face1=0;
var face2=0;
var face3=0;

var arrowHelper1cube;
var arrowHelper2cube;
var arrowHelper3cube;

var arrowHelper1con;
var arrowHelper2con;
var arrowHelper3con;

var IsPlay = false;

var HistoryRecord = [];

var Record = [];

var single = [5,11,13,15,17,23];

var matrix = new Array(26);

var oldInd = {
	ind: 0,
	faceInd: 0,
	normal: [0,0,0],
	g: 0,
	x: 0,
	y: 0,
	z: 0
}

var bufInd = {
	ind: 0,
	faceInd: 0,
	normal: [0,0,0],
	g: 0,
	x: 0,
	y: 0,
	z: 0
}

var curInd = {
	ind: 0,
	faceInd: 0,
	normal: [0,0,0],
	g: 0,
	x: 0,
	y: 0,
	z: 0
}

var oldRot = {
	x: 1,
	y: 1,
	z: 1
}

var rotateDelta = {
	x: 0,
	y: 0,
	z: 0
}
var line = 0;
var result = 0; 
var rotate = false;

var puzzle = {
  scene: null, camera: null, renderer: null, 
  container: null, controls: null, group: null, group1: null, group2: null,
  clock: null, stats: null, dragControls: null, begin: 0, end: 0, delta: 0, track: 0,
  plane: null, selection: null, offset: new THREE.Vector3(), objects: [], grp: [],
  raycaster: new THREE.Raycaster(),
  cube_panel: null,
  CM: new CubeMatrix(),

  init: function() {

    // Create main scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(100, 45, 90);
	//this.camera.position.set(90, -85, 90);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // Prepare webgl renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(this.scene.fog.color);
    // Prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // Events
    THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    // Prepare Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 8;
	//this.controls.maxDistance = 4;


    // Prepare clock
    this.clock = new THREE.Clock();

    // Prepare stats
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '20px';
    this.stats.domElement.style.bottom = '30px';
    this.stats.domElement.style.zIndex = 1;
    this.container.appendChild( this.stats.domElement );
	
	// Prepare stats
    this.cube_panel = new RubicPanel();
    this.cube_panel.domElement.style.position = 'absolute';
    this.cube_panel.domElement.style.left = '20px';
    this.cube_panel.domElement.style.bottom = '5px';
    this.cube_panel.domElement.style.zIndex = 1;
    this.container.appendChild( this.cube_panel.domElement );

    // Add lights
    this.scene.add( new THREE.AmbientLight(0x444444));

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);

    // Display skybox
    this.addSkybox();

    var object, material, radius;
	
	this.group = new THREE.Group();
   	
	this.scene.add(this.group);
	
	arrowHelper1cube = new THREE.ArrowHelper( new THREE.Vector3(1,0,0), new THREE.Vector3( 0, 0, 0 ), 3, 0xf00000 );
	this.scene.add( arrowHelper1cube );
  
    arrowHelper2cube = new THREE.ArrowHelper( new THREE.Vector3(0,1,0), new THREE.Vector3( 0, 0, 0 ), 3, 0xffffff );
	this.scene.add( arrowHelper2cube );
        
    arrowHelper3cube = new THREE.ArrowHelper( new THREE.Vector3(0,0,1), new THREE.Vector3( 0, 0, 0 ), 3, 0x00ff00 );
	this.scene.add( arrowHelper3cube );
	
	
	arrowHelper1con = new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), new THREE.Vector3( 0, 0, 0 ), 4, 0xf000ff);
	this.scene.add( arrowHelper1con );
  
    arrowHelper2con = new THREE.ArrowHelper( new THREE.Vector3(0,1,0), new THREE.Vector3( 0, 0, 0 ), 4, 0xffff00 );
	this.scene.add( arrowHelper2con );
        
    arrowHelper3con = new THREE.ArrowHelper( new THREE.Vector3(0,0,1), new THREE.Vector3( 0, 0, 0 ), 4, 0x00ffff );
	this.scene.add( arrowHelper3con );
	
{
var g1 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g1.faces[0].color = new THREE.Color(0, 0, 0);
g1.faces[1].color = new THREE.Color(0, 0, 0);
g1.faces[2].color = new THREE.Color(0xffff00);
g1.faces[3].color = new THREE.Color(0xffff00);
g1.faces[4].color = new THREE.Color(0, 0, 0);
g1.faces[5].color = new THREE.Color(0, 0, 0);
g1.faces[6].color = new THREE.Color(1, 0, 0);
g1.faces[7].color = new THREE.Color(1, 0, 0);
g1.faces[8].color = new THREE.Color(0, 0, 0);
g1.faces[9].color = new THREE.Color(0, 0, 0);
g1.faces[10].color = new THREE.Color(0, 0, 1);
g1.faces[11].color = new THREE.Color(0, 0, 1);
var m1 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g2 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g2.faces[0].color = new THREE.Color(0, 0, 0);
g2.faces[1].color = new THREE.Color(0, 0, 0);
g2.faces[2].color = new THREE.Color(0, 0, 0);
g2.faces[3].color = new THREE.Color(0, 0, 0);
g2.faces[4].color = new THREE.Color(0, 0, 0);
g2.faces[5].color = new THREE.Color(0, 0, 0);
g2.faces[6].color = new THREE.Color(1, 0, 0);
g2.faces[7].color = new THREE.Color(1, 0, 0);
g2.faces[8].color = new THREE.Color(0, 0, 0);
g2.faces[9].color = new THREE.Color(0, 0, 0);
g2.faces[10].color = new THREE.Color(0, 0, 1);
g2.faces[11].color = new THREE.Color(0, 0, 1);
var m2 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g3 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g3.faces[0].color = new THREE.Color(0xFF8000);
g3.faces[1].color = new THREE.Color(0xFF8000);
g3.faces[2].color = new THREE.Color(0,0,0);
g3.faces[3].color = new THREE.Color(0,0,0);
g3.faces[4].color = new THREE.Color(0,0,0);
g3.faces[5].color = new THREE.Color(0,0,0);
g3.faces[6].color = new THREE.Color(1,0,0);
g3.faces[7].color = new THREE.Color(1,0,0);
g3.faces[8].color = new THREE.Color(0,0,0);
g3.faces[9].color = new THREE.Color(0,0,0);
g3.faces[10].color = new THREE.Color(0,0,1);
g3.faces[11].color = new THREE.Color(0,0,1);
var m3 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g4 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g4.faces[0].color = new THREE.Color(0,0,0);
g4.faces[1].color = new THREE.Color(0,0,0);
g4.faces[2].color = new THREE.Color(0xffff00);
g4.faces[3].color = new THREE.Color(0xffff00);
g4.faces[4].color = new THREE.Color(0,0,0);
g4.faces[5].color = new THREE.Color(0,0,0);
g4.faces[6].color = new THREE.Color(0,0,0);
g4.faces[7].color = new THREE.Color(0,0,0);
g4.faces[8].color = new THREE.Color(0,0,0);
g4.faces[9].color = new THREE.Color(0,0,0);
g4.faces[10].color = new THREE.Color(0,0,1);
g4.faces[11].color = new THREE.Color(0,0,1);
var m4 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g5 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g5.faces[0].color = new THREE.Color(0,0,0);
g5.faces[1].color = new THREE.Color(0,0,0);
g5.faces[2].color = new THREE.Color(0,0,0);
g5.faces[3].color = new THREE.Color(0,0,0);
g5.faces[4].color = new THREE.Color(0,0,0);
g5.faces[5].color = new THREE.Color(0,0,0);
g5.faces[6].color = new THREE.Color(0,0,0);
g5.faces[7].color = new THREE.Color(0,0,0);
g5.faces[8].color = new THREE.Color(0,0,0);
g5.faces[9].color = new THREE.Color(0,0,0);
g5.faces[10].color = new THREE.Color(0,0,1);
g5.faces[11].color = new THREE.Color(0,0,1);
var m5 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g6 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g6.faces[0].color = new THREE.Color(0xFF8000);
g6.faces[1].color = new THREE.Color(0xFF8000);
g6.faces[2].color = new THREE.Color(0,0,0);
g6.faces[3].color = new THREE.Color(0,0,0);
g6.faces[4].color = new THREE.Color(0,0,0);
g6.faces[5].color = new THREE.Color(0,0,0);
g6.faces[6].color = new THREE.Color(0,0,0);
g6.faces[7].color = new THREE.Color(0,0,0);
g6.faces[8].color = new THREE.Color(0,0,0);
g6.faces[9].color = new THREE.Color(0,0,0);
g6.faces[10].color = new THREE.Color(0,0,1);
g6.faces[11].color = new THREE.Color(0,0,1);
var m6 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g7 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g7.faces[0].color = new THREE.Color(0,0,0);
g7.faces[1].color = new THREE.Color(0,0,0);
g7.faces[2].color = new THREE.Color(0xffff00);
g7.faces[3].color = new THREE.Color(0xffff00);
g7.faces[4].color = new THREE.Color(0xffffff);
g7.faces[5].color = new THREE.Color(0xffffff);
g7.faces[6].color = new THREE.Color(0,0,0);
g7.faces[7].color = new THREE.Color(0,0,0);
g7.faces[8].color = new THREE.Color(0,0,0);
g7.faces[9].color = new THREE.Color(0,0,0);
g7.faces[10].color = new THREE.Color(0,0,1);
g7.faces[11].color = new THREE.Color(0,0,1);
var m7 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g8 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g8.faces[0].color = new THREE.Color(0,0,0);
g8.faces[1].color = new THREE.Color(0,0,0);
g8.faces[2].color = new THREE.Color(0,0,0);
g8.faces[3].color = new THREE.Color(0,0,0);
g8.faces[4].color = new THREE.Color(0xffffff);
g8.faces[5].color = new THREE.Color(0xffffff);
g8.faces[6].color = new THREE.Color(0,0,0);
g8.faces[7].color = new THREE.Color(0,0,0);
g8.faces[8].color = new THREE.Color(0,0,0);
g8.faces[9].color = new THREE.Color(0,0,0);
g8.faces[10].color = new THREE.Color(0,0,1);
g8.faces[11].color = new THREE.Color(0,0,1);
var m8 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g9 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g9.faces[0].color = new THREE.Color(0xFF8000);
g9.faces[1].color = new THREE.Color(0xFF8000);
g9.faces[2].color = new THREE.Color(0,0,0);
g9.faces[3].color = new THREE.Color(0,0,0);
g9.faces[4].color = new THREE.Color(0xffffff);
g9.faces[5].color = new THREE.Color(0xffffff);
g9.faces[6].color = new THREE.Color(0,0,0);
g9.faces[7].color = new THREE.Color(0,0,0);
g9.faces[8].color = new THREE.Color(0,0,0);
g9.faces[9].color = new THREE.Color(0,0,0);
g9.faces[10].color = new THREE.Color(0,0,1);
g9.faces[11].color = new THREE.Color(0,0,1);
var m9 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

//second layer

var g10 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g10.faces[0].color = new THREE.Color(0,0,0);
g10.faces[1].color = new THREE.Color(0,0,0);
g10.faces[2].color = new THREE.Color(0xffff00);
g10.faces[3].color = new THREE.Color(0xffff00);
g10.faces[4].color = new THREE.Color(0,0,0);
g10.faces[5].color = new THREE.Color(0,0,0);
g10.faces[6].color = new THREE.Color(1,0,0);
g10.faces[7].color = new THREE.Color(1,0,0);
g10.faces[8].color = new THREE.Color(0,0,0);
g10.faces[9].color = new THREE.Color(0,0,0);
g10.faces[10].color = new THREE.Color(0,0,0);
g10.faces[11].color = new THREE.Color(0,0,0);
var m10 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g11 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g11.faces[0].color = new THREE.Color(0,0,0);
g11.faces[1].color = new THREE.Color(0,0,0);
g11.faces[2].color = new THREE.Color(0,0,0);
g11.faces[3].color = new THREE.Color(0,0,0);
g11.faces[4].color = new THREE.Color(0,0,0);
g11.faces[5].color = new THREE.Color(0,0,0);
g11.faces[6].color = new THREE.Color(1,0,0);
g11.faces[7].color = new THREE.Color(1,0,0);
g11.faces[8].color = new THREE.Color(0,0,0);
g11.faces[9].color = new THREE.Color(0,0,0);
g11.faces[10].color = new THREE.Color(0,0,0);
g11.faces[11].color = new THREE.Color(0,0,0);
var m11 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g12 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g12.faces[0].color = new THREE.Color(0xFF8000);
g12.faces[1].color = new THREE.Color(0xFF8000);
g12.faces[2].color = new THREE.Color(0,0,0);
g12.faces[3].color = new THREE.Color(0,0,0);
g12.faces[4].color = new THREE.Color(0,0,0);
g12.faces[5].color = new THREE.Color(0,0,0);
g12.faces[6].color = new THREE.Color(1,0,0);
g12.faces[7].color = new THREE.Color(1,0,0);
g12.faces[8].color = new THREE.Color(0,0,0);
g12.faces[9].color = new THREE.Color(0,0,0);
g12.faces[10].color = new THREE.Color(0,0,0);
g12.faces[11].color = new THREE.Color(0,0,0);
var m12 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g13 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g13.faces[0].color = new THREE.Color(0,0,0);
g13.faces[1].color = new THREE.Color(0,0,0);
g13.faces[2].color = new THREE.Color(0xffff00);
g13.faces[3].color = new THREE.Color(0xffff00);
g13.faces[4].color = new THREE.Color(0,0,0);
g13.faces[5].color = new THREE.Color(0,0,0);
g13.faces[6].color = new THREE.Color(0,0,0);
g13.faces[7].color = new THREE.Color(0,0,0);
g13.faces[8].color = new THREE.Color(0,0,0);
g13.faces[9].color = new THREE.Color(0,0,0);
g13.faces[10].color = new THREE.Color(0,0,0);
g13.faces[11].color = new THREE.Color(0,0,0);
var m13 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g14 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g14.faces[0].color = new THREE.Color(0,0,0);
g14.faces[1].color = new THREE.Color(0,0,0);
g14.faces[2].color = new THREE.Color(0,0,0);
g14.faces[3].color = new THREE.Color(0,0,0);
g14.faces[4].color = new THREE.Color(0,0,0);
g14.faces[5].color = new THREE.Color(0,0,0);
g14.faces[6].color = new THREE.Color(0,0,0);
g14.faces[7].color = new THREE.Color(0,0,0);
g14.faces[8].color = new THREE.Color(0,0,0);
g14.faces[9].color = new THREE.Color(0,0,0);
g14.faces[10].color = new THREE.Color(0,0,0);
g14.faces[11].color = new THREE.Color(0,0,0);
var m14 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g15 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g15.faces[0].color = new THREE.Color(0xFF8000);
g15.faces[1].color = new THREE.Color(0xFF8000);
g15.faces[2].color = new THREE.Color(0,0,0);
g15.faces[3].color = new THREE.Color(0,0,0);
g15.faces[4].color = new THREE.Color(0,0,0);
g15.faces[5].color = new THREE.Color(0,0,0);
g15.faces[6].color = new THREE.Color(0,0,0);
g15.faces[7].color = new THREE.Color(0,0,0);
g15.faces[8].color = new THREE.Color(0,0,0);
g15.faces[9].color = new THREE.Color(0,0,0);
g15.faces[10].color = new THREE.Color(0,0,0);
g15.faces[11].color = new THREE.Color(0,0,0);
var m15 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g16 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g16.faces[0].color = new THREE.Color(0,0,0);
g16.faces[1].color = new THREE.Color(0,0,0);
g16.faces[2].color = new THREE.Color(0xffff00);
g16.faces[3].color = new THREE.Color(0xffff00);
g16.faces[4].color = new THREE.Color(0xffffff);
g16.faces[5].color = new THREE.Color(0xffffff);
g16.faces[6].color = new THREE.Color(0,0,0);
g16.faces[7].color = new THREE.Color(0,0,0);
g16.faces[8].color = new THREE.Color(0,0,0);
g16.faces[9].color = new THREE.Color(0,0,0);
g16.faces[10].color = new THREE.Color(0,0,0);
g16.faces[11].color = new THREE.Color(0,0,0);
var m16 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g17 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g17.faces[0].color = new THREE.Color(0,0,0);
g17.faces[1].color = new THREE.Color(0,0,0);
g17.faces[2].color = new THREE.Color(0,0,0);
g17.faces[3].color = new THREE.Color(0,0,0);
g17.faces[4].color = new THREE.Color(0xffffff);
g17.faces[5].color = new THREE.Color(0xffffff);
g17.faces[6].color = new THREE.Color(0,0,0);
g17.faces[7].color = new THREE.Color(0,0,0);
g17.faces[8].color = new THREE.Color(0,0,0);
g17.faces[9].color = new THREE.Color(0,0,0);
g17.faces[10].color = new THREE.Color(0,0,0);
g17.faces[11].color = new THREE.Color(0,0,0);
var m17 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g18 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g18.faces[0].color = new THREE.Color(0xFF8000);
g18.faces[1].color = new THREE.Color(0xFF8000);
g18.faces[2].color = new THREE.Color(0,0,0);
g18.faces[3].color = new THREE.Color(0,0,0);
g18.faces[4].color = new THREE.Color(0xffffff);
g18.faces[5].color = new THREE.Color(0xffffff);
g18.faces[6].color = new THREE.Color(0,0,0);
g18.faces[7].color = new THREE.Color(0,0,0);
g18.faces[8].color = new THREE.Color(0,0,0);
g18.faces[9].color = new THREE.Color(0,0,0);
g18.faces[10].color = new THREE.Color(0,0,0);
g18.faces[11].color = new THREE.Color(0,0,0);
var m18 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

//third layer

var g19 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g19.faces[0].color = new THREE.Color(0,0,0);
g19.faces[1].color = new THREE.Color(0,0,0);
g19.faces[2].color = new THREE.Color(0xffff00);
g19.faces[3].color = new THREE.Color(0xffff00);
g19.faces[4].color = new THREE.Color(0,0,0);
g19.faces[5].color = new THREE.Color(0,0,0);
g19.faces[6].color = new THREE.Color(1,0,0);
g19.faces[7].color = new THREE.Color(1,0,0);
g19.faces[8].color = new THREE.Color(0,1,0);
g19.faces[9].color = new THREE.Color(0,1,0);
g19.faces[10].color = new THREE.Color(0,0,0);
g19.faces[11].color = new THREE.Color(0,0,0);
var m19 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g20 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g20.faces[0].color = new THREE.Color(0,0,0);
g20.faces[1].color = new THREE.Color(0,0,0);
g20.faces[2].color = new THREE.Color(0,0,0);
g20.faces[3].color = new THREE.Color(0,0,0);
g20.faces[4].color = new THREE.Color(0,0,0);
g20.faces[5].color = new THREE.Color(0,0,0);
g20.faces[6].color = new THREE.Color(1,0,0);
g20.faces[7].color = new THREE.Color(1,0,0);
g20.faces[8].color = new THREE.Color(0,1,0);
g20.faces[9].color = new THREE.Color(0,1,0);
g20.faces[10].color = new THREE.Color(0,0,0);
g20.faces[11].color = new THREE.Color(0,0,0);
var m20 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g21 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g21.faces[0].color = new THREE.Color(0xFF8000);
g21.faces[1].color = new THREE.Color(0xFF8000);
g21.faces[2].color = new THREE.Color(0,0,0);
g21.faces[3].color = new THREE.Color(0,0,0);
g21.faces[4].color = new THREE.Color(0,0,0);
g21.faces[5].color = new THREE.Color(0,0,0);
g21.faces[6].color = new THREE.Color(1,0,0);
g21.faces[7].color = new THREE.Color(1,0,0);
g21.faces[8].color = new THREE.Color(0,1,0);
g21.faces[9].color = new THREE.Color(0,1,0);
g21.faces[10].color = new THREE.Color(0,0,0);
g21.faces[11].color = new THREE.Color(0,0,0);
var m21 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g22 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g22.faces[0].color = new THREE.Color(0,0,0);
g22.faces[1].color = new THREE.Color(0,0,0);
g22.faces[2].color = new THREE.Color(0xffff00);
g22.faces[3].color = new THREE.Color(0xffff00);
g22.faces[4].color = new THREE.Color(0,0,0);
g22.faces[5].color = new THREE.Color(0,0,0);
g22.faces[6].color = new THREE.Color(0,0,0);
g22.faces[7].color = new THREE.Color(0,0,0);
g22.faces[8].color = new THREE.Color(0,1,0);
g22.faces[9].color = new THREE.Color(0,1,0);
g22.faces[10].color = new THREE.Color(0,0,0);
g22.faces[11].color = new THREE.Color(0,0,0);
var m22 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g23 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g23.faces[0].color = new THREE.Color(0,0,0);
g23.faces[1].color = new THREE.Color(0,0,0);
g23.faces[2].color = new THREE.Color(0,0,0);
g23.faces[3].color = new THREE.Color(0,0,0);
g23.faces[4].color = new THREE.Color(0,0,0);
g23.faces[5].color = new THREE.Color(0,0,0);
g23.faces[6].color = new THREE.Color(0,0,0);
g23.faces[7].color = new THREE.Color(0,0,0);
g23.faces[8].color = new THREE.Color(0,1,0);
g23.faces[9].color = new THREE.Color(0,1,0);
g23.faces[10].color = new THREE.Color(0,0,0);
g23.faces[11].color = new THREE.Color(0,0,0);
var m23 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g24 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g24.faces[0].color = new THREE.Color(0xFF8000);
g24.faces[1].color = new THREE.Color(0xFF8000);
g24.faces[2].color = new THREE.Color(0,0,0);
g24.faces[3].color = new THREE.Color(0,0,0);
g24.faces[4].color = new THREE.Color(0,0,0);
g24.faces[5].color = new THREE.Color(0,0,0);
g24.faces[6].color = new THREE.Color(0,0,0);
g24.faces[7].color = new THREE.Color(0,0,0);
g24.faces[8].color = new THREE.Color(0,1,0);
g24.faces[9].color = new THREE.Color(0,1,0);
g24.faces[10].color = new THREE.Color(0,0,0);
g24.faces[11].color = new THREE.Color(0,0,0);
var m24 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g25 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g25.faces[0].color = new THREE.Color(0,0,0);
g25.faces[1].color = new THREE.Color(0,0,0);
g25.faces[2].color = new THREE.Color(0xffff00);
g25.faces[3].color = new THREE.Color(0xffff00);
g25.faces[4].color = new THREE.Color(0xffffff);
g25.faces[5].color = new THREE.Color(0xffffff);
g25.faces[6].color = new THREE.Color(0,0,0);
g25.faces[7].color = new THREE.Color(0,0,0);
g25.faces[8].color = new THREE.Color(0,1,0);
g25.faces[9].color = new THREE.Color(0,1,0);
g25.faces[10].color = new THREE.Color(0,0,0);
g25.faces[11].color = new THREE.Color(0,0,0);
var m25 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g26 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g26.faces[0].color = new THREE.Color(0,0,0);
g26.faces[1].color = new THREE.Color(0,0,0);
g26.faces[2].color = new THREE.Color(0,0,0);
g26.faces[3].color = new THREE.Color(0,0,0);
g26.faces[4].color = new THREE.Color(0xffffff);
g26.faces[5].color = new THREE.Color(0xffffff);
g26.faces[6].color = new THREE.Color(0,0,0);
g26.faces[7].color = new THREE.Color(0,0,0);
g26.faces[8].color = new THREE.Color(0,1,0);
g26.faces[9].color = new THREE.Color(0,1,0);
g26.faces[10].color = new THREE.Color(0,0,0);
g26.faces[11].color = new THREE.Color(0,0,0);
var m26 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g27 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g27.faces[0].color = new THREE.Color(0xFF8000);
g27.faces[1].color = new THREE.Color(0xFF8000);
g27.faces[2].color = new THREE.Color(0,0,0);
g27.faces[3].color = new THREE.Color(0,0,0);
g27.faces[4].color = new THREE.Color(0xffffff);
g27.faces[5].color = new THREE.Color(0xffffff);
g27.faces[6].color = new THREE.Color(0,0,0);
g27.faces[7].color = new THREE.Color(0,0,0);
g27.faces[8].color = new THREE.Color(0,1,0);
g27.faces[9].color = new THREE.Color(0,1,0);
g27.faces[10].color = new THREE.Color(0,0,0);
g27.faces[11].color = new THREE.Color(0,0,0);
var m27 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );
}
    let cube = new Map([
	[1, [-1, -1, -1, g1, m1] ],
  	[2, [0, -1, -1, g2, m2] ],
  	[3, [1, -1, -1, g3, m3] ],
  	
    [4, [-1, 0, -1, g4, m4] ],
  	[5, [0, 0, -1, g5, m5] ],
  	[6, [1, 0, -1, g6, m6] ],
  	
    [7, [-1, 1, -1, g7, m7] ],
  	[8, [0, 1, -1, g8, m8] ],
  	[9, [1, 1, -1, g9, m9] ],
  
	
    [10, [-1, -1, 0, g10, m10] ],
  	[11, [0, -1, 0, g11, m11] ],
  	[12, [1, -1, 0, g12, m12] ],
  	
    [13, [-1, 0, 0, g13, m13] ],
  	[14, [0, 0, 0, g14, m14] ],
  	[15, [1, 0, 0, g15, m15] ],
  	
    [16, [-1, 1, 0, g16, m16] ],
  	[17, [0, 1, 0, g17, m17] ],
  	[18, [1, 1, 0, g18, m18] ],

  	
    [19, [-1, -1, 1, g19, m19] ],
  	[20, [0, -1, 1, g20, m20] ],
  	[21, [1, -1, 1, g21, m21] ],
  	
    [22, [-1, 0, 1, g22, m22] ],
  	[23, [0, 0, 1, g23, m23] ],
  	[24, [1, 0, 1, g24, m24] ],
  	
    [25, [-1, 1, 1, g25, m25] ],
  	[26, [0, 1, 1, g26, m26] ],
  	[27, [1, 1, 1, g27, m27] ]
    ]); 

	var flag =  new Boolean(false);

    for (var i = 1; i < 28 ; i++) {
      cube.get(i)[4].transparent = true;
      object = new THREE.Mesh(cube.get(i)[3], cube.get(i)[4]);

      object.scale.x = 0.95;
      object.scale.y = 0.95;
      object.scale.z = 0.95;

      object.position.x = cube.get(i)[0];
      object.position.y = cube.get(i)[1];
      object.position.z = cube.get(i)[2];
	  
	  object.className = "" + i;
	  
	  this.scene.add(object);
	  this.objects.push(object);
	  flag = false;
    }
  },
  
  addSkybox: function() {
    var iSBrsize = 500;
    var uniforms = {
      topColor: {type: "c", value: new THREE.Color(0x0077ff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
      offset: {type: "f", value: iSBrsize}, exponent: {type: "f", value: 1.5}
    }

    var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
    skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
    skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  },
  
  onDocumentMouseDown: function (event) {
    event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y =  - ( event.clientY / window.innerHeight ) * 2 + 1;

    puzzle.raycaster.setFromCamera(  mouse, puzzle.camera );
    
	mouseIsDown = true;
	
	var intersects = puzzle.raycaster.intersectObjects(puzzle.objects, true);
	
	if (intersects.length > 0 && mouseIsDown) {
		puzzle.controls.enabled = false;
	} else {
		{
		curInd.ind = 0;
		curInd.faceInd = 0;
		curInd.x = 0;
		curInd.y = 0;
		curInd.z = 0;
		oldInd.ind = 0;
		oldInd.faceInd = 0;
		oldInd.x = 0;
		oldInd.y = 0;
		oldInd.z = 0;
		}
	}
	
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y =  - ( event.clientY / window.innerHeight ) * 2 + 1;
    puzzle.raycaster.setFromCamera(  mouse, puzzle.camera );

	var intersects = puzzle.raycaster.intersectObjects(puzzle.objects, true);
	
	if (intersects != null && intersects.length > 0 && mouseIsDown) {
		puzzle.controls.enabled = false;
		var object = intersects[0].object;
		let vector = new THREE.Vector3();
		object.getWorldPosition(vector);
		
		if (filter(object.className,intersects[0].faceIndex)) {
			curInd.ind = object.className;
			curInd.faceInd = getFaceIndex(intersects[0].faceIndex);
			curInd.normal = getWorldNormal(object, intersects[0].face.normal);
			curInd.g = getType(curInd.ind);
			
			curInd.x = Math.round(vector.x);
			curInd.y = Math.round(vector.y);
			curInd.z = Math.round(vector.z);

			oldInd.ind = bufInd.ind;
			oldInd.faceInd = bufInd.faceInd;
			oldInd.normal = bufInd.normal;
			oldInd.g = bufInd.g;
			
			oldInd.x = bufInd.x;
			oldInd.y = bufInd.y;
			oldInd.z = bufInd.z;
			
			if (bufInd.ind != curInd.ind) {
				bufInd.x = Math.round(vector.x);
				bufInd.y = Math.round(vector.y);
				bufInd.z = Math.round(vector.z);
				let vec = new THREE.Vector3();
				puzzle.group.getWorldPosition(vec);
				setDirect(curInd,oldInd);
				bufInd.ind = object.className;
				bufInd.faceInd = getFaceIndex(intersects[0].faceIndex);
				bufInd.normal = getWorldNormal(object, intersects[0].face.normal);
				bufInd.g = getType(bufInd.ind);
			} 
		}	
	} else {
		{
		curInd.ind = 0;
		curInd.faceInd = 0;
		curInd.x = 0;
		curInd.y = 0;
		curInd.z = 0;
		oldInd.ind = 0;
		oldInd.faceInd = 0;
		oldInd.x = 0;
		oldInd.y = 0;
		oldInd.z = 0;
		bufInd.ind = 0;
		bufInd.faceInd = 0;
		bufInd.x = 0;
		bufInd.y = 0;
		bufInd.z = 0;
		}
	}
	
  },
  onDocumentMouseUp: function (event) {
	
	event.preventDefault();

    // Enable the controls
    puzzle.controls.enabled = true;
    puzzle.selection = null;
	mouseIsDown = false;
	{
	curInd.ind = 0;
	curInd.faceInd = 0;
	curInd.x = 0;
	curInd.y = 0;
	curInd.z = 0;
	oldInd.ind = 0;
	oldInd.faceInd = 0;
	oldInd.x = 0;
	oldInd.y = 0;
	oldInd.z = 0;
	}	
  },
  
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
  rotator();
}

// Update controls and stats
function update() {
  var clock_delta = puzzle.clock.getDelta();

  puzzle.controls.update(clock_delta);
  puzzle.stats.update();
   
  if (!rotate && Break) {
	
	result = Math.floor(Math.random() * 100);

	if (result == 12) move(1,0,1);
	if (result == 23) move(1,0,-1);
	
	if (result == 22) move(1,1,1);
	if (result == 25) move(1,1,-1);

	if (result == 32) move(1,-1,1);
	if (result == 1) move(1,-1,-1);


	if (result == 56) move(2,0,1);
	if (result == 67) move(2,0,-1);

	if (result == 71) move(2,1,1);
	if (result == 8) move(2,1,-1);

	if (result == 61) move(2,-1,1);
	if (result == 48) move(2,-1,-1);
	
	if (result == 92) move(3,0,1);
	if (result == 10) move(3,0,-1);

	if (result == 19) move(3,1,1);
	if (result == 45) move(3,1,-1);

	if (result == 69) move(3,-1,1);
	if (result == 95) move(3,-1,-1);	
	
	if (rotate) HistoryRecord.push(result);

   
    
  }
 
  if (!rotate && IsPlay) {
	 if (line >= 0) {
		 convertCodeToMove(Record[line]);
		 line--;
	 } else {
		//Record = []; 
		IsPlay = false;
	 }
	 
  }
 
  if (!rotate) {
  	AssemblingCube(puzzle.CM.Cube3D.Matrix);
 }

  puzzle.cube_panel.update(TransportMatrix, puzzle.CM.Cube3D.Matrix,"" + line + " " + result);
}

// Render the scene
function render() {
  if (puzzle.renderer) {
    puzzle.renderer.render(puzzle.scene, puzzle.camera);
  }
  
  getCurrCoords();
}

// Initialize lesson on page load
function initializePuzzle() {
	puzzle.init();
	puzzle.CM.GetTransportMatrix();
	animate();
}
 
function filter(i,f) {
	var et;
	var s = Number.parseInt(i);
	switch (s) {
		case 1:
		  et = [2,3,6,7,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 2: 
		  et = [6,7,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 3: 
		  et = [0,1,6,7,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 4: 
		  et = [2,3,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 5: 
		  et = [10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 6: 
		  et = [0,1,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 7: 
		  et = [2,3,4,5,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 8: 
		  et = [4,5,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 9: 
		  et = [0,1,4,5,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 10: 
		  et = [2,3,6,7];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 11: 
		  et = [6,7];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 12: 
		  et = [0,1,6,7];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 13: 
		  et = [2,3];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 15: 
		  et = [0,1];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 16: 
		  et = [2,3,4,5];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 17: 
		  et = [4,5];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 18: 
		  et = [0,1,4,5];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 19: 
		  et = [2,3,6,7,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 20: 
		  et = [6,7,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 21: 
		  et = [0,1,6,7,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 22: 
		  et = [2,3,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 23: 
		  et = [8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 24: 
		  et = [0,1,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 25: 
		  et = [2,3,4,5,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 26: 
		  et = [4,5,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 27: 
		  et = [0,1,4,5,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		return false;
	}
}

function getFaceIndex(i) {
	switch (i) {
		case 0:
		case 1:
			return 1;
		break;
		case 2:
		case 3:
			return 2;
		break;
		case 4:
		case 5:
			return 3;
		break;
		case 6:
		case 7:
			return 4;
		break;
		case 8:
		case 9:
			return 5;
		break;
		case 10:
		case 11:
			return 6;
		break;
		return -1;
	}
}	

function setDirect(c,o){
	let dlt = 0.1;
	if (!rotate && !IsPlay && !Break) {
		checkFirstPlane(c,o,dlt);
		checkSecondPlane(c,o,dlt);
		checkThirdPlane(c,o,dlt);
		checkFourthPlane(c,o,dlt);
		checkFivethPlane(c,o,dlt);
		checkSixthPlane(c,o,dlt);
	}
}

//orange plane
function checkFirstPlane(c,o,delta) {
	if (c.x == 1 && o.x == 1 && c.normal.x == 1 ) {
				
		if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
			if (c.y - o.y < 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,-delta,0);
				setDirectForModel([-2,0,0]);
			}  else 
			if (c.z - o.z > 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,-delta,0);
				setDirectForModel([0,0,2]);
			} 
			if (c.y - o.y > 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,delta,0);
				setDirectForModel([2,0,0]);
			}  else 
			if (c.z - o.z < 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,delta,0);
				setDirectForModel([0,0,-2]);
			} 
		}

		if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
			if (c.y - o.y < 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,-delta,1);
				setDirectForModel([-3,0,0]);
			}  else 
			if (c.z - o.z > 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,-delta,1);
				setDirectForModel([0,0,1]);
			} 
			if (c.y - o.y > 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,delta,1);
				setDirectForModel([3,0,0]);
			}  else 
			if (c.z - o.z < 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,delta,1);
				setDirectForModel([0,0,-1]);
			} 

			if (c.y - o.y < 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,-delta,-1);
				setDirectForModel([-1,0,0]);
			}  else 
			if (c.z - o.z > 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,-delta,-1);
				setDirectForModel([0,0,3]);
			} 
			if (c.y - o.y > 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,delta,-1);
				setDirectForModel([1,0,0]);
			}  else 
			if (c.z - o.z < 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,delta,-1);
				setDirectForModel([0,0,-3]);
			} 
		}
	}
}

//green plane
function checkSecondPlane(c,o,delta) {
	if (c.z == 1 && o.z == 1 && c.normal.z == 1 ) {
				
		if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
			if (c.y - o.y < 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,delta,0);
				setDirectForModel([0,-2,0]);
			}  else 
			if (c.x - o.x > 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,delta,0);
				setDirectForModel([0,0,-2]);
			} 
			if (c.y - o.y > 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,-delta,0);
				setDirectForModel([0,2,0]);
			}  else 
			if (c.x - o.x < 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,-delta,0);
				setDirectForModel([0,0,2]);
			} 
		}

		if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
			if (c.y - o.y < 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,delta,1);
				setDirectForModel([0,-3,0]);
			}  else 
			if (c.x - o.x > 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,delta,1);
				setDirectForModel([0,0,-1]);
			} 
			if (c.y - o.y > 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,-delta,1);
				setDirectForModel([0,3,0]);
			}  else 
			if (c.x - o.x < 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,-delta,1);
				setDirectForModel([0,0,1]);
			} 

			if (c.y - o.y < 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,delta,-1);
				setDirectForModel([0,-1,0]);
			}  else 
			if (c.x - o.x > 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,delta,-1);
				setDirectForModel([0,0,-3]);
			} 
			if (c.y - o.y > 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,-delta,-1);
				setDirectForModel([0,1,0]);
			}  else 
			if (c.x - o.x < 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,-delta,-1);
				setDirectForModel([0,0,3]);
			} 
		}
	}
}
 
//yellow plane
function checkThirdPlane(c,o,delta) {
	if (c.x == -1 && o.x == -1 && c.normal.x == -1 ) {
				
		if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
			if (c.y - o.y < 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,delta,0);
				setDirectForModel([2,0,0]);
			}  else 
			if (c.z - o.z > 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,delta,0);
				setDirectForModel([0,0,-2]);
			} 
			if (c.y - o.y > 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,-delta,0);
				setDirectForModel([-2,0,0]);
			}  else 
			if (c.z - o.z < 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,-delta,0);
				setDirectForModel([0,0,2]);
			} 
		}

		if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
			if (c.y - o.y < 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,delta,1);
				setDirectForModel([3,0,0]);
			}  else 
			if (c.z - o.z > 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,delta,1);
				setDirectForModel([0,0,-1]);
			} 
			if (c.y - o.y > 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,-delta,1);
				setDirectForModel([-3,0,0]);
			}  else 
			if (c.z - o.z < 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,-delta,1);
				setDirectForModel([0,0,1]);
			} 

			if (c.y - o.y < 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,delta,-1);
				setDirectForModel([1,0,0]);
			}  else 
			if (c.z - o.z > 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,delta,-1);
				setDirectForModel([0,0,-3]);
			} 
			if (c.y - o.y > 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,-delta,-1);
				setDirectForModel([-1,0,0]);
			}  else 
			if (c.z - o.z < 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,-delta,-1);
				setDirectForModel([0,0,3]);
			} 
		}
	}
}

//blue panel
function checkFourthPlane(c,o,delta) {
	if (c.z == -1 && o.z == -1 && c.normal.z == -1 ) {
				
		if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
			if (c.y - o.y < 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,-delta,0);
				setDirectForModel([0,2,0]);
			}  else 
			if (c.x - o.x > 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,-delta,0);
				setDirectForModel([0,0,2]);
			} 
			if (c.y - o.y > 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,delta,0);
				setDirectForModel([0,-2,0]);
			}  else 
			if (c.x - o.x < 0 && c.y == 0 && o.y == 0)	{
				setGroup(2,delta,0);
				setDirectForModel([0,0,-2]);
			} 
		}

		if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
			if (c.y - o.y < 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,-delta,1);
				setDirectForModel([0,3,0]);
			}  else 
			if (c.x - o.x > 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,-delta,1);
				setDirectForModel([0,0,1]);
			} 
			if (c.y - o.y > 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,delta,1);
				setDirectForModel([0,-3,0]);
			}  else 
			if (c.x - o.x < 0 && c.y == 1 && o.y == 1)	{
				setGroup(2,delta,1);
				setDirectForModel([0,0,-1]);
			} 

			if (c.y - o.y < 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,-delta,-1);
				setDirectForModel([0,1,0]);
			}  else 
			if (c.x - o.x > 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,-delta,-1);
				setDirectForModel([0,0,3]);
			} 
			if (c.y - o.y > 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,delta,-1);
				setDirectForModel([0,-1,0]);
			}  else 
			if (c.x - o.x < 0 && c.y == -1 && o.y == -1)	{
				setGroup(2,delta,-1);
				setDirectForModel([0,0,-3]);
			} 
		}
	}
}

//white panel
function checkFivethPlane(c,o,delta) {
	if (c.y == 1 && o.y == 1 && c.normal.y == 1 ) {
				
		if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
			if (c.z - o.z < 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,-delta,0);
				setDirectForModel([0,2,0]);
			}  else 
			if (c.x - o.x > 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,-delta,0);
				setDirectForModel([-2,0,0]);
			} 
			if (c.z - o.z > 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,delta,0);
				setDirectForModel([0,-2,0]);
			}  else 
			if (c.x - o.x < 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,delta,0);
				setDirectForModel([2,0,0]);
			} 
		}

		if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
			if (c.z - o.z < 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,-delta,1);
				setDirectForModel([0,3,0]);
			}  else 
			if (c.x - o.x > 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,-delta,1);
				setDirectForModel([-3,0,0]);
			} 
			if (c.z - o.z > 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,delta,1);
				setDirectForModel([0,-3,0]);
			}  else 
			if (c.x - o.x < 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,delta,1);
				setDirectForModel([3,0,0]);
			} 

			if (c.z - o.z < 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,-delta,-1);
				setDirectForModel([0,1,0]);
			}  else 
			if (c.x - o.x > 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,-delta,-1);
				setDirectForModel([-1,0,0]);
			} 
			if (c.z - o.z > 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,delta,-1);
				setDirectForModel([0,-1,0]);
			}  else 
			if (c.x - o.x < 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,delta,-1);
				setDirectForModel([1,0,0]);
			} 
		}
	}
}
 
//red panel
function checkSixthPlane(c,o,delta) {
	if (c.y == -1 && o.y == -1 && c.normal.y == -1 ) {
				
		if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
			if (c.z - o.z < 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,delta,0);
				setDirectForModel([0,-2,0]);
			}  else 
			if (c.x - o.x > 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,delta,0);
				setDirectForModel([2,0,0]);
			} 
			if (c.z - o.z > 0 && c.x == 0 && o.x == 0)	{
				setGroup(1,-delta,0);
				setDirectForModel([0,2,0]);
			}  else 
			if (c.x - o.x < 0 && c.z == 0 && o.z == 0)	{
				setGroup(3,-delta,0);
				setDirectForModel([-2,0,0]);
			} 
		}

		if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
			if (c.z - o.z < 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,delta,1);
				setDirectForModel([0,-3,0]);
			}  else 
			if (c.x - o.x > 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,delta,1);
				setDirectForModel([3,0,0]);
			} 
			if (c.z - o.z > 0 && c.x == 1 && o.x == 1)	{
				setGroup(1,-delta,1);
				setDirectForModel([0,3,0]);
			}  else 
			if (c.x - o.x < 0 && c.z == 1 && o.z == 1)	{
				setGroup(3,-delta,1);
				setDirectForModel([-3,0,0]);
			} 

			if (c.z - o.z < 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,delta,-1);
				setDirectForModel([0,-1,0]);
			}  else 
			if (c.x - o.x > 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,delta,-1);
				setDirectForModel([1,0,0]);
			} 
			if (c.z - o.z > 0 && c.x == -1 && o.x == -1)	{
				setGroup(1,-delta,-1);
				setDirectForModel([0,1,0]);
			}  else 
			if (c.x - o.x < 0 && c.z == -1 && o.z == -1)	{
				setGroup(3,-delta,-1);
				setDirectForModel([-1,0,0]);
			} 
		}
	}
}
 
function setGroup(selector, delta, position) {
	let sgn = (delta < 0 )?-1:1;
	if (!IsPlay) Record.push(convertMoveToCode(selector,position,sgn));
	ungroup();
	
	for (let objIndex in puzzle.objects) {
		let obj = puzzle.objects[objIndex];
		
		rotateDelta.x = 0;
		rotateDelta.y = 0;
		rotateDelta.z = 0;
		
		switch (selector) {
			case 1:
				rotateDelta.x = delta;
				if (obj.position.x == position) {
					puzzle.group.attach(obj);
					puzzle.group.add(obj);
				}
			break;
			case 2:
				rotateDelta.y = delta;
				if (obj.position.y == position) {
					puzzle.group.attach(obj);
					puzzle.group.add(obj);
				}
			break;
			case 3:
				rotateDelta.z = delta;
				if (obj.position.z == position) {
					puzzle.group.attach(obj);
					puzzle.group.add(obj);
				}
			break;
		}
	}
	
	rotate = true;
}	

function rotator() {
  let rx = puzzle.group.rotation.x;
  let ry = puzzle.group.rotation.y; 
  let rz = puzzle.group.rotation.z;

  if (rotate) {
	
	puzzle.group.rotation.x += rotateDelta.x;
	puzzle.group.rotation.y += rotateDelta.y;
	puzzle.group.rotation.z += rotateDelta.z;
	
  }
 
  
  if ((Math.trunc(rx * 10) == -1 * 15)) {
			
	if (Math.trunc(rx * 10) == -1 * 15)	puzzle.group.rotation.x = -1 * 1.57;  
	oldRot.x = Math.trunc(puzzle.group.rotation.x * 10);
	rotate = false;
  }
  
  if ((Math.trunc(rx * 10) == 1 * 15)) {
			
	if (Math.trunc(rx * 10) == 1 * 15)	puzzle.group.rotation.x = 1 * 1.57;  
	oldRot.x = Math.trunc(puzzle.group.rotation.x * 10);	
	rotate = false;
  }

  if ((Math.trunc(ry * 10) == -1 * 15)) {
			
	if (Math.trunc(ry * 10) == -1 * 15)	puzzle.group.rotation.y = -1 * 1.57;  
	oldRot.y = Math.trunc(puzzle.group.rotation.y * 10);
	rotate = false;
  }
  
  if ((Math.trunc(ry * 10) == 1 * 15)) {
			
	if (Math.trunc(ry * 10) == 1 * 15) puzzle.group.rotation.y = 1 * 1.57;  
	oldRot.y = Math.trunc(puzzle.group.rotation.y * 10);	
	rotate = false;
  }

  if ((Math.trunc(rz * 10) == -1 * 15)) {
			
	if (Math.trunc(rz * 10) == -1 * 15) puzzle.group.rotation.z = -1 * 1.57;  
	oldRot.z = Math.trunc(puzzle.group.rotation.z * 10);
	rotate = false;
  }
  
  if ((Math.trunc(rz * 10) == 1 * 15)) {
			
	if (Math.trunc(rz * 10) == 1 * 15) puzzle.group.rotation.z = 1 * 1.57;  
	oldRot.z = Math.trunc(puzzle.group.rotation.z * 10);	
	rotate = false;
  }
}

function ungroup() {
		if (puzzle.group.children.length == 0) {
			puzzle.group.rotation.x = 0;
			puzzle.group.rotation.y = 0;
			puzzle.group.rotation.z = 0;
			return;
		}
		
        for (var i = 8; i > -1; i--) {
     
            var gg = puzzle.group.children[i]; 
            
            let vector = new THREE.Vector3();
            let quat = new THREE.Quaternion();
            
            gg.getWorldPosition(vector);
            gg.getWorldQuaternion(quat);
            
            puzzle.group.remove(gg);
            puzzle.scene.attach(gg);
            
            gg.position.x = Math.round(vector.x);
            gg.position.y = Math.round(vector.y);
            gg.position.z = Math.round(vector.z);

            let rotation = new THREE.Euler()
            rotation.setFromQuaternion(quat)

            gg.rotation.x = rotation.x ;
            gg.rotation.y = rotation.y ;
            gg.rotation.z = rotation.z ;
			gg = null;
        };
		
		if (puzzle.group.children.length == 0) {
			puzzle.group.rotation.x = 0;
			puzzle.group.rotation.y = 0;
			puzzle.group.rotation.z = 0;
			return;
		}
		
}

function getType(inp) {
	
	let s = ['5','11','13','15','17','23'];
	
	if (s.indexOf(inp)  != -1) {
		return 1;
	}
	
	if (inp % 2 == 0) {
		return 2;
	}
	
	return 3;
}

function getWorldNormal(object, normal) {
	var normalMatrix = new THREE.Matrix3().getNormalMatrix( object.matrixWorld );
    var worldNormal = normal.clone().applyMatrix3( normalMatrix ).normalize();
	worldNormal.x = Math.round(worldNormal.x);
	worldNormal.y = Math.round(worldNormal.y);
	worldNormal.z = Math.round(worldNormal.z);
	return  worldNormal;
}

function getCurrCoords() {
 let v1 = new THREE.Vector3(1,0,0);
 let v2 = new THREE.Vector3(0,1,0);
 let v3 = new THREE.Vector3(0,0,1);

 let v1c = new THREE.Vector3(0,0,1);
 let v2c = new THREE.Vector3(0,1,1);
 let v3c = new THREE.Vector3(-1,0,1);
 
 v1.applyMatrix4(puzzle.objects[13].matrixWorld).normalize();
 v2.applyMatrix4(puzzle.objects[13].matrixWorld).normalize();
 v3.applyMatrix4(puzzle.objects[13].matrixWorld).normalize();

 v1c.applyQuaternion( puzzle.camera.quaternion ).normalize();
 v2c.applyQuaternion( puzzle.camera.quaternion ).normalize();
 v3c.applyQuaternion( puzzle.camera.quaternion ).normalize();
 
  /* console.log("-----------------------");   
  console.log("v1: object: " + getOctant(v1) + "  camera: " + getOctant(v1c));     
  console.log("v2: object: " + getOctant(v2) + "  camera: " + getOctant(v2c));     
  console.log("v3: object: " + getOctant(v3) + "  camera: " + getOctant(v3c)); 
  console.log("-----------------------");   
   */
  
  for ( let m in single) {
	let v1p = new THREE.Vector3(1,0,0);
    let v2p = new THREE.Vector3(0,1,0);
    let v3p = new THREE.Vector3(0,0,1);
 
	v1p.applyMatrix4(puzzle.objects[single[m]].matrixWorld).normalize();
	v2p.applyMatrix4(puzzle.objects[single[m]].matrixWorld).normalize();
	v3p.applyMatrix4(puzzle.objects[single[m]].matrixWorld).normalize();

    if (getOctant(v1c) == getOctant(v1p) && getOctant(v2c) == getOctant(v2p) && getOctant(v3c) == getOctant(v3p)) {
		//console.log("index: " + single[m]); 
	}		
	
  }
  
  arrowHelper1cube.setDirection(v1);
  arrowHelper2cube.setDirection(v2);
  arrowHelper3cube.setDirection(v3);
  
  arrowHelper1con.setDirection(v1c)
  arrowHelper2con.setDirection(v2c);
  arrowHelper3con.setDirection(v3c);
  
}

function getOctant(vector) {
	
	if (getSign(vector.x) == 1 && getSign(vector.y) == 1 && getSign(vector.z) == 1 ) {
		return 1;
	}
	
	if (getSign(vector.x) == 0 && getSign(vector.y) == 1 && getSign(vector.z) == 1 ) {
		return 2;
	}
	
	if (getSign(vector.x) == 0 && getSign(vector.y) == 0 && getSign(vector.z) == 1 ) {
		return 3;
	}
	
	if (getSign(vector.x) == 1 && getSign(vector.y) == 0 && getSign(vector.z) == 1 ) {
		return 4;
	}
	
	if (getSign(vector.x) == 1 && getSign(vector.y) == 1 && getSign(vector.z) == 0 ) {
		return 5;
	}
	
	if (getSign(vector.x) == 0 && getSign(vector.y) == 1 && getSign(vector.z) == 0 ) {
		return 6;
	}
	
	if (getSign(vector.x) == 0 && getSign(vector.y) == 0 && getSign(vector.z) == 0 ) {
		return 7;
	}
	
	if (getSign(vector.x) == 1 && getSign(vector.y) == 0 && getSign(vector.z) == 0 ) {
		return 8;
	}
	
}

function getSign(p) {
	if (p>=0) {
		return 1;
	} else {
		return 0;
	}
}

function setDirectForModel(m) {
	puzzle.CM.Rotate(m);
	puzzle.CM.GetTransportMatrix();
}

function move(s,p,sgn) {
	let delta = sgn * 0.1;

	if (s == 1 && p == -1 && sgn == 1) {
		setGroup(1,delta,-1);
		setDirectForModel([0,-1,0]);
	}

	if (s == 1 && p == -1 && sgn == -1) {
		setGroup(1,delta,-1);
		setDirectForModel([0,1,0]);
	}


	if (s == 1 && p == 0 && sgn == 1) {
		setGroup(1,delta,0);
		setDirectForModel([0,-2,0]);
	}

	if (s == 1 && p == 0 && sgn == -1) {
		setGroup(1,delta,0);
		setDirectForModel([0,2,0]);
	}


	if (s == 1 && p == 1 && sgn == 1) {
		setGroup(1,delta,1);
		setDirectForModel([0,-3,0]);
	}

	if (s == 1 && p == 1 && sgn == -1) {
		setGroup(1,delta,1);
		setDirectForModel([0,3,0]);
	}




	if (s == 2 && p == -1 && sgn == 1) {
		setGroup(2,delta,-1);
		setDirectForModel([0,0,-3]);
	}

	if (s == 2 && p == -1 && sgn == -1) {
		setGroup(2,delta,-1);
		setDirectForModel([0,0,3]);
	}


	if (s == 2 && p == 0 && sgn == 1) {
		setGroup(2,delta,0);
		setDirectForModel([0,0,-2]);
	}

	if (s == 2 && p == 0 && sgn == -1) {
		setGroup(2,delta,0);
		setDirectForModel([0,0,2]);
	}

	if (s == 2 && p == 1 && sgn == 1) {
		setGroup(2,delta,1);
		setDirectForModel([0,0,-1]);
	}

	if (s == 2 && p == 1 && sgn == -1) {
		setGroup(2,delta,1);
		setDirectForModel([0,0,1]);
	}



	if (s == 3 && p == -1 && sgn == 1) {
		setGroup(3,delta,-1);
		setDirectForModel([1,0,0]);
	}

	if (s == 3 && p == -1 && sgn == -1) {
		setGroup(3,delta,-1);
		setDirectForModel([-1,0,0]);
	}


	if (s == 3 && p == 0 && sgn == 1) {
		setGroup(3,delta,0);
		setDirectForModel([2,0,0]);
	}

	if (s == 3 && p == 0 && sgn == -1) {
		setGroup(3,delta,0);
		setDirectForModel([-2,0,0]);
	}



	if (s == 3 && p == 1 && sgn == 1) {
		setGroup(3,delta,1);
		setDirectForModel([3,0,0]);
	}

	if (s == 3 && p == 1 && sgn == -1) {
		setGroup(3,delta,1);
		setDirectForModel([-3,0,0]);
	}

	//Break = false;
} 

if (window.addEventListener)
  window.addEventListener('load', initializePuzzle, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializePuzzle);
else window.onload = initializePuzzle;

var RubicPanel = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;height:100px;top:0;left:100;cursor:pointer;opacity:0.9;z-index:10000';
	
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );
	
	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {

		for ( var i = 0; i < container.children.length; i ++ ) {

			container.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		mode = id;

	}

	

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new RubicPanel.Panel( 'Cube layout', '#f08', '#201' ) );

	}

	showPanel( 0 );

	return {

		REVISION: 16,

		dom: container,

		addPanel: addPanel,
		showPanel: showPanel,

		update: function (value1, value2, value3) {
			memPanel.update(value1, value2, value3);
		},

		domElement: container,
		setMode: showPanel

	};

};

RubicPanel.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 95 * PR, HEIGHT = 130 * PR,
		TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
		GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
		GRAPH_WIDTH = 110 * PR, GRAPH_HEIGHT = 112 * PR;

	var canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH ;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:100px;height:150px';
	var context = canvas.getContext( '2d' );

	return {
		dom: canvas,

		update: function ( transportMatrix, mtx,value ) {
			context.fillStyle = "gray";
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, HEIGHT );

			function getColor( colorCode ) {
				let outColor;	
				switch (colorCode) {
					case 1:
						outColor = 'white';
						break;
					case 2:
						outColor = 'red';
						break;
					case 3:
						outColor = 'blue';
						break;
					case 4:
						outColor = 'green';
						break;
					case 5:
						outColor = 'yellow';
						break;
					case 6:
						outColor = '#ff8000';
						break;
				}
				return outColor;
		
			}

			context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
			context.textBaseline = 'top';

			context.fillStyle = bg;
			context.fillRect( 0, 0, WIDTH, HEIGHT );

			context.fillStyle = fg;
			context.fillText( name, TEXT_X, TEXT_Y );
			
			context.fillStyle = fg;
			context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT ); 

			context.fillStyle = bg;
			context.globalAlpha = 0.8;
			context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT ); 

			var delta_x_1 = 35;
			var delta_x_2 = 10;
			var delta_x_3 = 35;
			var delta_x_4 = 60;
			var delta_x_5 = 35;
			var delta_x_6 = 35;


			
			var delta_y_1 = 10;
			var delta_y_2 = 35;
			var delta_y_3 = 35;
			var delta_y_4 = 35;
			var delta_y_5 = 60;
			var delta_y_6 = 85;

			var divide = 7;

			
			for (var i = 0; i < 3; i++) 
				for (var j = 0; j < 3; j++) {
					context.fillStyle = getColor(transportMatrix[i][j]);
					context.fillRect( GRAPH_X + delta_x_1 + j * divide, GRAPH_Y + delta_y_1 + i * divide , 6 , 5 );		
				}
				   
			for (var i = 3; i < 6; i++) 
				for (var j = 0; j < 3; j++) {
					context.fillStyle = getColor(transportMatrix[i][j]);
					context.fillRect( GRAPH_X + delta_x_2 + j * divide, GRAPH_Y + delta_y_2 + (i - 3) * divide , 6 , 5 );		
				}		

			for (var i = 6; i < 9; i++) 
				for (var j = 0; j < 3; j++) {
					context.fillStyle = getColor(transportMatrix[i][j]);
					context.fillRect( GRAPH_X + delta_x_3 + j * divide, GRAPH_Y + delta_y_3 + (i - 6) * divide , 6 , 5 );		
				}		
			
			for (var i = 9; i < 12; i++) 
				for (var j = 0; j < 3; j++) {
					context.fillStyle = getColor(transportMatrix[i][j]);
					context.fillRect( GRAPH_X + delta_x_4 + j * divide, GRAPH_Y + delta_y_4 + (i - 9) * divide , 6 , 5 );		
				}
			
			for (var i = 12; i < 15; i++) 
				for (var j = 0; j < 3; j++) {
					context.fillStyle = getColor(transportMatrix[i][j]);
					context.fillRect( GRAPH_X + delta_x_5 + j * divide, GRAPH_Y + delta_y_5 + (i - 12) * divide , 6 , 5 );		
				}
			
			for (var i = 15; i < 18; i++) 
				for (var j = 0; j < 3; j++) {
					context.fillStyle = getColor(transportMatrix[i][j]);
					context.fillRect( GRAPH_X + delta_x_6 + j * divide, GRAPH_Y + delta_y_6 + (i - 15) * divide , 6 , 5 );		
				}

			
			if (FirstLayerIsAssmebled(mtx) &&
				SecondLayerIsAssmebled(mtx) &&
				ThirdLayerIsAssmebled(mtx)) 
			{
				context.font = 'bold ' + ( 7 * PR ) + 'px Helvetica,Arial,sans-serif';
				context.fillStyle = "white";
				context.fillText( 
					"The cube has assembled!  "
				, TEXT_X, TEXT_Y + 14 );
				Record = [];
			}
		}

	};

};

function convertMoveToCode(a,b,s) {
	let i = a - 1;
	let j = b + 1;
	return MoveToCode[i][j] * s;
}

function convertCodeToMove(c,r = true) {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (Math.abs(c) == MoveToCode[i][j] )  {
				let a = i + 1;
				let b = j - 1;
				let s;
				if (r) {
					s = (c <= 0)? 1: -1;
				} else {
					s = (c <= 0)? -1: 1;
				}
				
				move(a,b,s);
				return true;
			}
		}
	}
	return false;	
}



function setBreak() {
	
	if (!Break) {
		Break = true;
		ModeStatus = ModeStatusEnum.Idle;	
	} else {
		Break = false;
	}
}

function setChangeStatus() {
	if (!Break) ModeStatus = ModeStatusEnum.InitFindMainBlockFirstLayer;
}

function Play() {
	//console.log(HistoryRecord);

	if (!rotate) {
		line = Record.length - 1;		
		IsPlay = true;
	}
}

function Clear() {
	Record = [];
}

function Print() {
	console.log("[" + Record + "]");
	console.log( Record + "]");
	console.log("[" + Record);
}

//The assembling code


function AssemblingCube(mtx) {
	switch (ModeStatus) {
		case ModeStatusEnum.Idle:
			break;
		case ModeStatusEnum.InitFindMainBlockFirstLayer:
			InitFindMainBlockFirstLayer();
			break;
		case ModeStatusEnum.FindMainBlockFirstLayer:
			FindMainBlockFirstLayer(mtx)
			break;
		case ModeStatusEnum.MoveMainBlockFirstLayer:
			MoveMainBlockFirstLayer();
			break;
		case ModeStatusEnum.InitFourTwoColorBlockFirstLayer:
			InitFourTwoColorBlockFirstLayer();
			break;	
		case ModeStatusEnum.FindFourTwoColorBlockFirstLayer:
			FindFourTwoColorBlockFirstLayer(mtx);
			break;	
		case ModeStatusEnum.MoveFourTwoColorBlockFirstLayer:
			MoveFourTwoColorBlockFirstLayer();
			break;
		case ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer:
			MovePerTemplate(MoveTemplate,ModeStatusEnum.FindFourTwoColorBlockFirstLayer,mtx);
			break;
		case ModeStatusEnum.RecaliblrateCrossForFirstLayer:
			RecaliblrateCrossForFirstLayer(mtx);
			break;
		case ModeStatusEnum.InitFourThreeColorBlockFirstLayer:
			InitFourThreeColorBlockFirstLayer();				
			break;
		case ModeStatusEnum.FindFourThreeColorBlockFirstLayer:
			FindFourThreeColorBlockFirstLayer(mtx);				
			break;	
		case ModeStatusEnum.MoveFourThreeColorBlockFirstLayer:
			MoveFourThreeColorBlockFirstLayer();				
			break;	
		case ModeStatusEnum.MovePerTemplateThreeColorBlockFirstLayer:
			MovePerTemplate(MoveTemplate,ModeStatusEnum.FindFourThreeColorBlockFirstLayer,mtx);
			break;
		case ModeStatusEnum.InitFourTwoColorBlockSecondLayer:
			InitFourTwoColorBlockSecondLayer();				
			break;
		case ModeStatusEnum.FindFourTwoColorBlockSecondLayer:
			FindFourTwoColorBlockSecondLayer(mtx);				
			break;	
		case ModeStatusEnum.MoveFourTwoColorBlockSecondLayer:
			MoveFourTwoColorBlockSecondLayer();				
			break;	
		case ModeStatusEnum.MovePerTemplateTwoColorBlockSecondLayer:
			MovePerTemplate(MoveTemplate,ModeStatusEnum.FindFourTwoColorBlockSecondLayer,mtx);
			break;	
		case ModeStatusEnum.InitFourTwoColorBlockThirdLayer:
			InitFourTwoColorBlockThirdLayer();
			break;
		case ModeStatusEnum.FindFourTwoColorBlockThirdLayer:
			FindFourTwoColorBlockThirdLayer(mtx);
			break;	
		case ModeStatusEnum.MoveFourTwoColorBlockThirdLayer:
			MoveFourTwoColorBlockThirdLayer(mtx);
			break;
		case ModeStatusEnum.TurnRoundFourTwoColorBlockThirdLayer:
			TurnRoundFourTwoColorBlockThirdLayer(mtx);
			break;
		case ModeStatusEnum.MovePerTemplateTwoColorBlockThirdLayer:
			MovePerTemplate(MoveTemplate,ModeStatusEnum.FindFourTwoColorBlockThirdLayer,mtx);
			break;
	
		case ModeStatusEnum.InitFourThreeColorBlockThirdLayer:
			InitFourThreeColorBlockThirdLayer();
			break;
		case ModeStatusEnum.FindFourThreeColorBlockThirdLayer:
			FindFourThreeColorBlockThirdLayer(mtx);
			break;	
		case ModeStatusEnum.FindAnchorThirdLayer:
			FindAnchorThirdLayer(mtx);
			break;	
		case ModeStatusEnum.MoveFourThreeColorBlockThirdLayer:
			MoveFourThreeColorBlockThirdLayer(mtx);
			break;
		case ModeStatusEnum.MovePerTemplateThreeColorBlockThirdLayer:
			MovePerTemplate(MoveTemplate,ModeStatusEnum.FindFourThreeColorBlockThirdLayer,mtx);
			break;
		case ModeStatusEnum.TurnRoundPerTemplateThreeColorBlockThirdLayer:
			MovePerTemplate(MoveTemplate,ModeStatusEnum.TurnRoundFourThreeColorBlockThirdLayer,mtx);
			break;
		case ModeStatusEnum.TurnRoundFourThreeColorBlockThirdLayer:
			TurnRoundFourThreeColorBlockThirdLayer(mtx);
			break;	
		case ModeStatusEnum.RecaliblrateCrossForThirdLayer:
			RecaliblrateCrossForThirdLayer(mtx);
			break;	
					
	}
}


//The assembling basic functions

function FindBlock(block, mtx) {
	
	for (let i = 1; i < 4; i++) {
		for (let j = 1; j < 4; j++) {
			for (let k = 1; k < 4; k++) {
				if (i == 2 && j == 2 && k ==2 ) continue;
				let test = 0;
				for (let b = 1; b < 4; b++) {
					if ( block.b[b] == mtx[i][j][k].b[1] ) 
					{
						test++;
						break;	
					}

				}

				for (let b = 1; b < 4; b++) {
					if (block.b[b] == mtx[i][j][k].b[2] ) 
					{
						test++;
						break;	
					}

				}

				for (let b = 1; b < 4; b++) {
					if (block.b[b] == mtx[i][j][k].b[3] ) 
					{
						test++;
						break;	
					}

				}
				if (test == 3 && 
					( block.b[1] + block.b[2]  + block.b[3]) ==
					( mtx[i][j][k].b[1] + mtx[i][j][k].b[2]  +mtx[i][j][k].b[3])
					) {
					var exit_block = new Block(
						mtx[i][j][k].b[1],
						mtx[i][j][k].b[2],
						mtx[i][j][k].b[3],
						i,j,k);
					return exit_block;	
				}	
			}
		}
	}

	return null;
}

function GetCrossStatus(mtx) {
	let CrossSetup = 0;
	let CrossComplited = 0;
	let Block;
	let Status = CrossStatusEnum.CrossIsNotComplited;

	for (let i = 0; i < ListTarget.length; i++) {
		if (
			mtx[ ListTarget[i].b[4]][ListTarget[i].b[5]][ListTarget[i].b[6]].b[1] == ListTarget[i].b[1] &&
			mtx[ListTarget[i].b[4]][ListTarget[i].b[5]][ListTarget[i].b[6]].b[2] == ListTarget[i].b[2] &&
			mtx[ListTarget[i].b[4]][ListTarget[i].b[5]][ListTarget[i].b[6]].b[3] == ListTarget[i].b[3]
			) 
		{
			CrossComplited++;
		}

		Block = FindBlock(ListTarget[i],mtx);

		if ( 
				Block.b[4] == ListTarget[i].b[4] &&	
				Block.b[5] == ListTarget[i].b[5] &&
				Block.b[6] == ListTarget[i].b[6] 
		) 
		{
			CrossSetup++;
		}
	}

	if (CrossSetup == 4) {
		Status = CrossStatusEnum.CrossIsSetup;
	}

	if (CrossComplited == 4) {
		Status = CrossStatusEnum.CrossIsComplited;
	}

	return Status;
	
}

function GetBlockByListTarget(tc,mtx) {
	let Block;
	Block = mtx[ListTarget[tc].b[4]][ListTarget[tc].b[5]][ListTarget[tc].b[6]];
	Block.b[4] = ListTarget[tc].b[4];
	Block.b[5] = ListTarget[tc].b[5];
	Block.b[6] = ListTarget[tc].b[6];
	return Block;
}


function GetThreeColorBlockThirdLayerStatus(mtx) {
	let ThreeColorBlocksSetup = 0;
	let ThreeColorBlocksComplited = 0;
	let Block;
	let Status = ThreeColorBlockThirdLayerStatusEnum.BlockIsNotComplited;

	for (let i = 0; i < ListTarget.length; i++) {
		if (
			mtx[ListTarget[i].b[4]][ListTarget[i].b[5]][ListTarget[i].b[6]].b[1] == ListTarget[i].b[1] &&
			mtx[ListTarget[i].b[4]][ListTarget[i].b[5]][ListTarget[i].b[6]].b[2] == ListTarget[i].b[2] &&
			mtx[ListTarget[i].b[4]][ListTarget[i].b[5]][ListTarget[i].b[6]].b[3] == ListTarget[i].b[3]
			) 
		{
			ThreeColorBlocksComplited++;
		}

		Block = GetBlockByListTarget(i,mtx);

		if ( UnitInPlace(Block,mtx)) 
		{
			ThreeColorBlocksSetup++;
		}
	}

	if (ThreeColorBlocksSetup == 4) {
		Status = ThreeColorBlockThirdLayerStatusEnum.BlockIsSetup;
	}

	if (ThreeColorBlocksComplited == 4) {
		Status = ThreeColorBlockThirdLayerStatusEnum.BlockIsComplited;
	}

	return Status;
	
}

function AtLeastTwoBlocksIsInPlace(mtx) {
	let CounterBlocks = 0;
	let Block;
	

	for (let i = 0; i < ListTarget.length; i++) {

		Block = GetBlockByListTarget(i,mtx);

		if ( UnitInPlace(Block,mtx)) 
		{
			CounterBlocks++;
		}
	}

	if (CounterBlocks > 1) return true; else return false;
	
}

function MovePerTemplate(tmp,mode,mtx) {

	if (mode == 15 && TargetIndex == 0 && Tact == 0) {
		let a = 0;
	}

	if (tmp == undefined) {
		ModeStatus = ModeStatusEnum.FindFourTwoColorBlockSecondLayer;
		return;
	}

	if (Tact < tmp.length) {
		convertCodeToMove(MoveTemplate[Tact],false);
		Tact++; 
	} else {
		ModeStatus = mode;
	}
	/*
	CurrentBlock = FindBlock(TargetBlock,mtx);

	if (
		CurrentBlock.b[1] == TargetBlock.b[1] &&
		CurrentBlock.b[2] == TargetBlock.b[2] &&
		CurrentBlock.b[3] == TargetBlock.b[3] &&
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		Tact = 0;
		ModeStatus = mode;
	}
	*/
}

function SetMove(tmp,mode) {
	Tact = 0;
	MoveTemplate = tmp;
	ModeStatus = mode;
}

function UnitInPlace(block,mtx){
	let keys = new Map([
		['11',[2,1,2,1,2,2]],
		['13',[1,2,2,2,3,2]],
		['33',[2,3,2,3,2,2]],
		['31',[3,2,2,2,1,2]]
	]);
	
	let key = "" + block.b[4] + block.b[5];
    let colors = [];

	colors.push(mtx[keys.get(key)[0]][keys.get(key)[1]][keys.get(key)[2]].b[1]);
	colors.push(mtx[keys.get(key)[0]][keys.get(key)[1]][keys.get(key)[2]].b[2]);
	colors.push(mtx[keys.get(key)[0]][keys.get(key)[1]][keys.get(key)[2]].b[3]);

	colors.push(mtx[keys.get(key)[3]][keys.get(key)[4]][keys.get(key)[5]].b[1]);
	colors.push(mtx[keys.get(key)[3]][keys.get(key)[4]][keys.get(key)[5]].b[2]);
	colors.push(mtx[keys.get(key)[3]][keys.get(key)[4]][keys.get(key)[5]].b[3]);
	colors.push(2);

	let include = 0;

	if (colors.includes(block.b[1])) include++;
	if (colors.includes(block.b[2])) include++;
	if (colors.includes(block.b[3])) include++;

	if (include == 3) return true; else return false;
}

function Iterator(dlt = 1, rng = 3) {
	let res = TargetIndex + dlt;
	if (res > rng) res = res % rng
	if (res < 0) res = Math.abs(res % rng);
	TargetIndex = res;
}



function FirstLayerIsAssmebled(mtx) {
	let etalone_matrix = [
		[3,5,1,1,1,1],
		[3,0,1,1,2,1],
		[3,6,1,1,3,1],
		
		[0,5,1,2,1,1],
		[0,0,1,2,2,1],
		[0,6,1,2,3,1],
		
		[4,5,1,3,1,1],
		[4,0,1,3,2,1],
		[4,6,1,3,3,1]
	];

	let test = 0;
	for (let i = 1; i < 4; i++) {
		for (let j = 1; j < 4; j++) {
			for (let k = 1; k < 2; k++) {
				for (let a = 0; a < 9 ;a++) {
					
					if ( etalone_matrix[a][0] == mtx[i][j][k].b[1] &&
						 etalone_matrix[a][1] == mtx[i][j][k].b[2] &&
						 etalone_matrix[a][2] == mtx[i][j][k].b[3] &&
						 etalone_matrix[a][3] == i &&
						 etalone_matrix[a][4] == j &&
						 etalone_matrix[a][5] == k 
						 ) 
					{
						test++;	
					}

					
				}
			}
		}
	}

	if (test == 9) return true; else return false;
}

function SecondLayerIsAssmebled(mtx) {
	
	let etalone_matrix = [
		[3,5,0,1,1,2],
		[3,0,0,1,2,2],
		[3,6,0,1,3,2],

		[0,5,0,2,1,2],
		[0,0,0,2,2,2],
		[0,6,0,2,3,2],
		
		[4,5,0,3,1,2],
		[4,0,0,3,2,2],
		[4,6,0,3,3,2]
	];

	let test = 0;
	for (let i = 1; i < 4; i++) {
		for (let j = 1; j < 4; j++) {
			for (let k = 2; k < 3; k++) {
				for (let a = 0; a < 9 ;a++) {
					if ( etalone_matrix[a][0] == mtx[i][j][k].b[1] &&
						 etalone_matrix[a][1] == mtx[i][j][k].b[2] &&
						 etalone_matrix[a][2] == mtx[i][j][k].b[3] &&
						 etalone_matrix[a][3] == i &&
						 etalone_matrix[a][4] == j &&
						 etalone_matrix[a][5] == k  ) 
				    {
							test++;	
					}
				}
			}
		}
	}

	if (test == 9) return true; else return false;
}

function ThirdLayerIsAssmebled(mtx) {
	let etalone_matrix = [
		[3,5,2,1,1,3],
		[3,0,2,1,2,3],
		[3,6,2,1,3,3],

		[0,5,2,2,1,3],
		[0,0,2,2,2,3],
		[0,6,2,2,3,3],

		[4,5,2,3,1,3],
		[4,0,2,3,2,3],
		[4,6,2,3,3,3]
	];

	let test = 0;
	for (let i = 1; i < 4; i++) {
		for (let j = 1; j < 4; j++) {
			for (let k = 3; k < 4; k++) {
				for (let a = 0; a < 9 ;a++) {
					
					if ( etalone_matrix[a][0] == mtx[i][j][k].b[1] &&
						 etalone_matrix[a][1] == mtx[i][j][k].b[2] &&
						 etalone_matrix[a][2] == mtx[i][j][k].b[3]  &&
						 etalone_matrix[a][3] == i &&
						 etalone_matrix[a][4] == j &&
						 etalone_matrix[a][5] == k ) 
					{
						test++;	
					}

					
				}
			}
		}
	}

	if (test == 9) return true; else return false;
}



//The assembling job process functions

//The first layer assembly
//phase 1

function InitFindMainBlockFirstLayer() {
	TargetBlock = new Block(0,0,1,2,2,1); 	
	ModeStatus = ModeStatusEnum.FindMainBlockFirstLayer;
}

function FindMainBlockFirstLayer(mtx) {
	CurrentBlock = FindBlock(TargetBlock,mtx);
	ModeStatus = ModeStatusEnum.MoveMainBlockFirstLayer;
}

function MoveMainBlockFirstLayer() {
	if (
		CurrentBlock.b[1] == TargetBlock.b[1] &&
		CurrentBlock.b[2] == TargetBlock.b[2] &&
		CurrentBlock.b[3] == TargetBlock.b[3] &&
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		ModeStatus = ModeStatusEnum.InitFourTwoColorBlockFirstLayer;
		return;
	}
	
	let dx = CurrentBlock.b[4] - TargetBlock.b[4];
	let dy = CurrentBlock.b[5] - TargetBlock.b[5];
	let dz = CurrentBlock.b[6] - TargetBlock.b[6];

	
	if (rotate) return;
	if ( dx > 1 || dy > 1 || dz > 1) 
	{	
		move(1,0,-1);
	} else {
		if ( CurrentBlock.b[4] == 3 && CurrentBlock.b[5]  == 2 ) {
			move(1,0,-1);	
		} else if ( CurrentBlock.b[4] == 1 && CurrentBlock.b[5]  == 2 ) {
			move(1,0,1);		
		} else if ( CurrentBlock.b[4] == 2 && CurrentBlock.b[5]  == 1 ) {
			move(3,0,-1);		
		} else if ( CurrentBlock.b[4] == 2 && CurrentBlock.b[5]  == 3 ) {
			move(3,0,1);		
		}

	}
	ModeStatus = ModeStatusEnum.FindMainBlockFirstLayer;
		
}

//phase 2

function InitFourTwoColorBlockFirstLayer() {
	ListTarget = []; 
	ListTarget.push(new Block(3,0,1,1,2,1));
	ListTarget.push(new Block(0,5,1,2,1,1));
	ListTarget.push(new Block(4,0,1,3,2,1));
	ListTarget.push(new Block(0,6,1,2,3,1));
	TargetIndex = 0;
	ModeStatus = ModeStatusEnum.FindFourTwoColorBlockFirstLayer;
}

function FindFourTwoColorBlockFirstLayer(mtx) {
	TargetBlock = ListTarget[TargetIndex]; 
	CurrentBlock = FindBlock(TargetBlock,mtx);
	ModeStatus = ModeStatusEnum.MoveFourTwoColorBlockFirstLayer;
}

function MoveFourTwoColorBlockFirstLayer() {
	if (rotate) return;

	let dx = CurrentBlock.b[4] - TargetBlock.b[4];
	let dy = CurrentBlock.b[5] - TargetBlock.b[5];
	let dz = CurrentBlock.b[6] - TargetBlock.b[6];
	
	if (
		CurrentBlock.b[1] == TargetBlock.b[1] &&
		CurrentBlock.b[2] == TargetBlock.b[2] &&
		CurrentBlock.b[3] == TargetBlock.b[3] &&
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		if (TargetIndex < ListTarget.length - 1) {
			TargetIndex++; 
			ModeStatus = ModeStatusEnum.FindFourTwoColorBlockFirstLayer;
		} else {
			ModeStatus = ModeStatusEnum.RecaliblrateCrossForFirstLayer;
		}
		
		return;
	} else {
		if ( dx == 0 && dy == 0 && dz == 0) {
			if (CurrentBlock.b[4] == 3 && CurrentBlock.b[5] == 2) {
				Tact = 0;
				MoveTemplate = [-9,5,-9,5,-9,5,-9,5];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			} else if (CurrentBlock.b[4] == 2 && CurrentBlock.b[5] == 1) {
				Tact = 0;
				MoveTemplate = [1,5,1,5,1,5,1,5];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			} else if (CurrentBlock.b[4] == 1 && CurrentBlock.b[5] == 2) {
				Tact = 0;
				MoveTemplate = [7,5,7,5,7,5,7,5];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			} else if (CurrentBlock.b[4] == 2 && CurrentBlock.b[5] == 3) {
				Tact = 0;
				MoveTemplate = [3,5,3,5];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			}

			return;
		} 
	}

	if ( CurrentBlock.b[6] == 1 ) {
		if (CurrentBlock.b[4] == 3 && CurrentBlock.b[5] == 2) {
			Tact = 0;
			MoveTemplate = [-9,-9];
			ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
		} else if (CurrentBlock.b[4] == 2 && CurrentBlock.b[5] == 1) {
			Tact = 0;
			MoveTemplate = [1,1];
			ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
		} else if (CurrentBlock.b[4] == 1 && CurrentBlock.b[5] == 2) {
			Tact = 0;
			MoveTemplate = [7,7];
			ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
		} else if (CurrentBlock.b[4] == 2 && CurrentBlock.b[5] == 3) {
			Tact = 0;
			MoveTemplate = [-3,-3];
			ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
		}
	} else if ( CurrentBlock.b[6] == 2 ) {
		if ( (dx == 0  && Math.abs(dy) == 1) || (dy == 0  && Math.abs(dx) == 1) ) {
			if (dy == 0  && dx > 0 && CurrentBlock.b[5] == 1) {
				move(1,-1,-1);
			} else if ( dy == 0  && dx > 0  && CurrentBlock.b[5] == 3){
				move(1,1,-1);
			} else if (dy == 0  && dx < 0 && CurrentBlock.b[5] == 1) {
				move(1,-1,1);
			} else if (dy == 0  && dx < 0 && CurrentBlock.b[5] == 3){
				move(1,1,1);


			} else if ( dx == 0  && dy > 0  && CurrentBlock.b[4] == 1){
				move(3,-1,1);
			} else if (dx == 0  && dy > 0 && CurrentBlock.b[4] == 3) {
				move(3,1,1);
			} else if (dx == 0  && dy < 0 && CurrentBlock.b[4] == 1){
				move(3,-1,-1);
			} else if ( dx == 0  && dy < 0  && CurrentBlock.b[4] == 3){
				move(3,1,-1);
			}  

			ModeStatus = ModeStatusEnum.FindFourTwoColorBlockFirstLayer;

		} else {
			if ( CurrentBlock.b[4] == 1 && CurrentBlock.b[5] == 1 ) {
				Tact = 0;
				MoveTemplate = [7,4,-7];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			} else if ( CurrentBlock.b[4] == 1  && CurrentBlock.b[5] == 3 ){
				Tact = 0;
				MoveTemplate = [-3,-4,3];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			} else if ( CurrentBlock.b[4] == 3  && CurrentBlock.b[5] == 3 ) {
				Tact = 0;
				MoveTemplate = [3,-4,-3];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			} else if ( CurrentBlock.b[4] == 3  && CurrentBlock.b[5] == 1 ){
				Tact = 0;
				MoveTemplate = [9,-4,-9];
				ModeStatus = ModeStatusEnum.MovePerTemplateTwoColorBlockFirstLayer;
			}
		}
	} else 	if ( CurrentBlock.b[6] == 3 ) {	
		if ( dx == 0 && dy == 0) {
			if (CurrentBlock.b[4] == 3 && CurrentBlock.b[5] == 2){
				move(3,1,1);
			} else if (CurrentBlock.b[4] == 2 && CurrentBlock.b[5] == 1) {
				move(1,-1,1);	
			} else if (CurrentBlock.b[4] == 1 && CurrentBlock.b[5] == 2) {
				move(3,-1,1);	
			} else if (CurrentBlock.b[4] == 2 && CurrentBlock.b[5] == 3) {
				move(1,1,-1);	
			}
		} else {
			move(2,-1,1);	
		}
		
		ModeStatus = ModeStatusEnum.FindFourTwoColorBlockFirstLayer;
	} 
	
	
}

function RecaliblrateCrossForFirstLayer(mtx) {
	TargetBlock = new Block(4,0,0,3,2,2); 
	CurrentBlock = FindBlock(TargetBlock,mtx);
	
	if (
		CurrentBlock.b[1] == TargetBlock.b[1] &&
		CurrentBlock.b[2] == TargetBlock.b[2] &&
		CurrentBlock.b[3] == TargetBlock.b[3] &&
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		let test = 0;
		let oldTagetBlock = TargetBlock;

		for (let counter = 0; counter < ListTarget.length; counter++) {
			TargetBlock = ListTarget[counter];
			CurrentBlock = FindBlock(TargetBlock,mtx);
			if (
				CurrentBlock.b[1] == TargetBlock.b[1] &&
				CurrentBlock.b[2] == TargetBlock.b[2] &&
				CurrentBlock.b[3] == TargetBlock.b[3] &&
				CurrentBlock.b[4] == TargetBlock.b[4] &&
				CurrentBlock.b[5] == TargetBlock.b[5] &&
				CurrentBlock.b[6] == TargetBlock.b[6] ) 
			{
				test++;
			}
		}
		
		if (test == 4) {
			ModeStatus = ModeStatusEnum.InitFourThreeColorBlockFirstLayer;
			
		} else {
			TargetBlock = oldTagetBlock;
			ModeStatus = ModeStatusEnum.InitFourTwoColorBlockFirstLayer;	
		}

		
		
	} else {
		move(2,0,1);
		ModeStatus = ModeStatusEnum.RecaliblrateCrossForFirstLayer;
	}

}

//phase 3

function InitFourThreeColorBlockFirstLayer() {
	ListTarget = []; 
	ListTarget.push(new Block(3,6,1,1,3,1));
	ListTarget.push(new Block(4,6,1,3,3,1));
	ListTarget.push(new Block(4,5,1,3,1,1));
	ListTarget.push(new Block(3,5,1,1,1,1));
	
	TargetIndex = 0;
	ModeStatus = ModeStatusEnum.FindFourThreeColorBlockFirstLayer;
}

function FindFourThreeColorBlockFirstLayer(mtx) {
	TargetBlock = ListTarget[TargetIndex]; 
	CurrentBlock = FindBlock(TargetBlock,mtx);
	ModeStatus = ModeStatusEnum.MoveFourThreeColorBlockFirstLayer;
}

function MoveFourThreeColorBlockFirstLayer() {
	if (rotate) return;

	let dx = CurrentBlock.b[4] - TargetBlock.b[4];
	let dy = CurrentBlock.b[5] - TargetBlock.b[5];
	let dz = CurrentBlock.b[6] - TargetBlock.b[6];

	let key = "c" + CurrentBlock.b[4] + "c" + CurrentBlock.b[5] + "c" + CurrentBlock.b[6] +
	"t" + TargetBlock.b[4] + "t" + TargetBlock.b[5];

	let rotation_key = "k" + CurrentBlock.b[1] + "k" + CurrentBlock.b[2] + "k" + CurrentBlock.b[3] +
	"t" + TargetBlock.b[4] + "t" + TargetBlock.b[5] + "r";

	if (
		CurrentBlock.b[1] == TargetBlock.b[1] &&
		CurrentBlock.b[2] == TargetBlock.b[2] &&
		CurrentBlock.b[3] == TargetBlock.b[3] &&
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		if (TargetIndex < ListTarget.length - 1) {
			TargetIndex++; 
			ModeStatus = ModeStatusEnum.FindFourThreeColorBlockFirstLayer;
		} else {
			ModeStatus = ModeStatusEnum.InitFourTwoColorBlockSecondLayer;
		}
		
		return;
	} else {
		if (dx == 0 && dy == 0 && dz == 0) {
			SetMove(DecisionMatrixForThreeColorFirstLayer.get(rotation_key),ModeStatusEnum.MovePerTemplateThreeColorBlockFirstLayer);
			return;
		}
	}
	
	SetMove(DecisionMatrixForThreeColorFirstLayer.get(key),ModeStatusEnum.MovePerTemplateThreeColorBlockFirstLayer);
}


//The second layer assembly
//phase 1

function InitFourTwoColorBlockSecondLayer() {
	ListTarget = []; 
	ListTarget.push(new Block(4,6,0,3,3,2));
	ListTarget.push(new Block(4,5,0,3,1,2));
	ListTarget.push(new Block(3,5,0,1,1,2));
	ListTarget.push(new Block(3,6,0,1,3,2));
	
	TargetIndex = 0;
	ModeStatus = ModeStatusEnum.FindFourTwoColorBlockSecondLayer;
}

function FindFourTwoColorBlockSecondLayer(mtx) {
	TargetBlock = ListTarget[TargetIndex]; 
	CurrentBlock = FindBlock(TargetBlock,mtx);
	ModeStatus = ModeStatusEnum.MoveFourTwoColorBlockSecondLayer;
}

function MoveFourTwoColorBlockSecondLayer() {
	if (rotate) return;

	let key = "k" + CurrentBlock.b[1] + "k" + CurrentBlock.b[2] + "k" + CurrentBlock.b[3] +
	"c" + CurrentBlock.b[4] + "c" + CurrentBlock.b[5] + "c" + CurrentBlock.b[6] +
	"t" + TargetBlock.b[4] + "t" + TargetBlock.b[5];

	let second_layer_key = "c" + CurrentBlock.b[4] + "c" + CurrentBlock.b[5] + "c" + CurrentBlock.b[6] + "s";

	if (
		CurrentBlock.b[1] == TargetBlock.b[1] &&
		CurrentBlock.b[2] == TargetBlock.b[2] &&
		CurrentBlock.b[3] == TargetBlock.b[3] &&
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		if (TargetIndex < ListTarget.length - 1) {
			TargetIndex++; 
			ModeStatus = ModeStatusEnum.FindFourTwoColorBlockSecondLayer;
		} else {
			ModeStatus = ModeStatusEnum.InitFourTwoColorBlockThirdLayer;
		}
		return;
	}
	
	if (CurrentBlock.b[6] == 2) {
		SetMove(DecisionMatrixForTwoColorSecondLayer.get(second_layer_key),ModeStatusEnum.MovePerTemplateTwoColorBlockSecondLayer);
	} else {
		SetMove(DecisionMatrixForTwoColorSecondLayer.get(key),ModeStatusEnum.MovePerTemplateTwoColorBlockSecondLayer);
	}
	
}

//The third layer assembly
//phase 1

function InitFourTwoColorBlockThirdLayer() {
	ListTarget = []; 
	ListTarget.push(new Block(3,0,2,1,2,3));
	ListTarget.push(new Block(0,6,2,2,3,3));
	ListTarget.push(new Block(4,0,2,3,2,3));
	ListTarget.push(new Block(0,5,2,2,1,3));
	TargetIndex = 0;
	ModeStatus = ModeStatusEnum.FindFourTwoColorBlockThirdLayer;
}

function FindFourTwoColorBlockThirdLayer(mtx) {
	if (TargetIndex < ListTarget.length) {
		TargetBlock = ListTarget[TargetIndex]; 
		CurrentBlock = FindBlock(TargetBlock,mtx);
	}
	
	switch (CrossStatus) {
		case CrossStatusEnum.CrossIsNotComplited:
			ModeStatus = ModeStatusEnum.MoveFourTwoColorBlockThirdLayer;
			break;
		case CrossStatusEnum.CrossIsSetup:
			ModeStatus = ModeStatusEnum.TurnRoundFourTwoColorBlockThirdLayer;
			break;
		case CrossStatusEnum.CrossComplited:
			ModeStatus = ModeStatusEnum.Idle;
			break;	
	}
	
}

function MoveFourTwoColorBlockThirdLayer(mtx) {
	if (rotate) return;

	let Status = GetCrossStatus(mtx);
	
	let key = "c" + CurrentBlock.b[4] + "c" + CurrentBlock.b[5] 
	
	if (Status == CrossStatusEnum.CrossIsSetup) {
		CrossStatus = CrossStatusEnum.CrossSetup;
		ModeStatus = ModeStatusEnum.TurnRoundFourTwoColorBlockThirdLayer;
		return;
	}

	if (
		CurrentBlock.b[4] == TargetBlock.b[4] &&
		CurrentBlock.b[5] == TargetBlock.b[5] &&
		CurrentBlock.b[6] == TargetBlock.b[6] ) 
	{
		if (TargetIndex < ListTarget.length) {
			TargetIndex++; 
		} else {
			TargetIndex = 0;
		}
	
		ModeStatus = ModeStatusEnum.FindFourTwoColorBlockThirdLayer;
	} else {

		SetMove(DecisionMatrixForTwoColorThirdLayer.get(key),ModeStatusEnum.MovePerTemplateTwoColorBlockThirdLayer);
	}
}

function TurnRoundFourTwoColorBlockThirdLayer(mtx) {
	if (rotate) return;

	let Status = GetCrossStatus(mtx);
	if (Status == CrossStatusEnum.CrossIsComplited ) {
		CrossStatus = Status;
	} else {
		CrossStatus = CrossStatusEnum.CrossIsSetup;
	}

	let key = "tb" + 
		mtx[1][2][3].b[1] +
		mtx[1][2][3].b[2] +
		mtx[1][2][3].b[3];

	if (Status == CrossStatusEnum.CrossIsComplited) {
		ModeStatus = ModeStatusEnum.InitFourThreeColorBlockThirdLayer;
		//ModeStatus = ModeStatusEnum.Idle;
		return;
	}
	


	if (DecisionMatrixForTwoColorThirdLayer.get(key) != undefined ) 
	{
		convertCodeToMove(4,false);
		ModeStatus = ModeStatusEnum.FindFourTwoColorBlockThirdLayer	;
	} else {
		SetMove([7,-5,7,-5,7,-5,7,-5],ModeStatusEnum.MovePerTemplateTwoColorBlockThirdLayer);
	}
	
}

//phase 2

function InitFourThreeColorBlockThirdLayer() {
	ListTarget = []; 
	ListTarget.push(new Block(3,6,2,1,3,3));
	ListTarget.push(new Block(4,6,2,3,3,3));
	ListTarget.push(new Block(4,5,2,3,1,3));
	ListTarget.push(new Block(3,5,2,1,1,3));
	TargetIndex = 0;
	ModeStatus = ModeStatusEnum.FindAnchorThirdLayer;
}

function FindFourThreeColorBlockThirdLayer(mtx) {
	ModeStatus = ModeStatusEnum.MoveFourThreeColorBlockThirdLayer;
}

function MoveFourThreeColorBlockThirdLayer(mtx) {

	if (rotate) return;

	let Status = GetThreeColorBlockThirdLayerStatus(mtx);
	let key = "rc" + CurrentBlock.b[4] + CurrentBlock.b[5];	
	if (Status == ThreeColorBlockThirdLayerStatusEnum.BlockIsSetup) {
		ModeStatus = ModeStatusEnum.TurnRoundFourThreeColorBlockThirdLayer;
		return;
	}  
	
	if (TryCounter < 4) {
		SetMove(DecisionMatrixForThreeColorThirdLayer.get(key),ModeStatus = ModeStatusEnum.MovePerTemplateThreeColorBlockThirdLayer);
		TryCounter++;
		return;
	} else {
		TryCounter = 0;
	}

	if (AtLeastTwoBlocksIsInPlace(mtx)) {
		if (AnchorIsShift) {
			TryCounter = 0;
			AnchorIsShift = false;
			ModeStatus = ModeStatusEnum.RecaliblrateCrossForThirdLayer;
			return;
		}

	}
	
}

function FindAnchorThirdLayer(mtx){
	CurrentBlock = GetBlockByListTarget(TargetIndex,mtx);
	if (UnitInPlace(CurrentBlock,mtx)) {
		Iterator(1);
		ModeStatus = ModeStatusEnum.MoveFourThreeColorBlockThirdLayer;
		TryCounter = 0; 
	} else {
		Iterator(1);
		if (TryCounter > 3) {
			convertCodeToMove(4,false);
			AnchorIsShift = true;
			TryCounter = 0; 
		} else {
			TryCounter++;
		}
		ModeStatus = ModeStatusEnum.FindAnchorThirdLayer;
	}
}

function TurnRoundFourThreeColorBlockThirdLayer(mtx) {
	CurrentBlock =  GetBlockByListTarget(0,mtx); 
	let key = "tb" + CurrentBlock.b[1] + CurrentBlock.b[2] + CurrentBlock.b[3];
	let grp = DecisionMatrixForThreeColorThirdLayer.get(key);
	let movies;

	let Status = GetThreeColorBlockThirdLayerStatus(mtx);
	
	if (Status == ThreeColorBlockThirdLayerStatusEnum.BlockIsComplited) {
		ModeStatus = ModeStatusEnum.Idle;
		return;
	}  	

	if (grp[0] == "g0") {
		convertCodeToMove(4,false);
	} else {
		movies = DecisionMatrixForThreeColorThirdLayer.get(grp[0]);
		SetMove(movies,ModeStatusEnum.TurnRoundPerTemplateThreeColorBlockThirdLayer);
	}
	
}

function RecaliblrateCrossForThirdLayer(mtx) {
	if (
		mtx[1][2][3].b[1] == 3 &&
		mtx[1][2][3].b[2] == 0 &&
		mtx[1][2][3].b[3] == 2 
	) {
		ModeStatus = ModeStatusEnum.FindAnchorThirdLayer;
	} else {
		convertCodeToMove(4,false);
		ModeStatus = ModeStatusEnum.RecaliblrateCrossForThirdLayer;
	}
}

