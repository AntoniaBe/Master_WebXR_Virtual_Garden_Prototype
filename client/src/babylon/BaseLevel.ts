declare let BABYLON: any;

export default class BaseLevel {

    private scene: any;
    private engine: any;
    private divFps: any;

    constructor(scene: any, engine: any) {
        this.scene = scene; 
        this.engine = engine;

        this.setSkyBox();
        this.createLight();
        this.run();
        this.resize();

        this.divFps = document.getElementById("fps");

        window.addEventListener('resize', () => {
            this.resize();
          });
    }


    public setSkyBox() {
        let skyBox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000 }, this.scene);
        let skyBoxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyBoxMaterial.backFaceCulling = false;
        skyBoxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("https://dl.dropbox.com/s/vqjk0t83oqnc1as/country.env", this.scene);
        skyBoxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyBoxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyBoxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyBox.material = skyBoxMaterial;
        return skyBox;
    }

    public createCamera() {
        // Create a FreeCamera, and set its position to {x: 0, y: 5, z: 10}
        const camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, 0.8, 0), this.scene);
        camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(5, 5, 5);
        camera.checkCollisions = true;

        camera.keysUp = []; // W or UP Arrow
        camera.keysDown = []; // S or DOWN ARROW
        camera.keysLeft = []; // A or LEFT ARROW
        camera.keysRight = []; // D or RIGHT ARROW
        camera.speed = 0;
        return camera;
    }

    public createLight() {
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 3, 0), this.scene);
        return light;
    }

    public createGround(){
        const ground = BABYLON.Mesh.CreateGround("ground1", 200, 200, 16, this.scene)
        let material = new BABYLON.StandardMaterial("grass", this.scene);
        material.diffuseColor = new BABYLON.Color3(.7, .7, .7);
        ground.material = material;
        ground.position.y = 0;
        ground.visibility = false;
        ground.checkCollisions = true;

        return ground;
    }

    public run() {
        this.engine.runRenderLoop(() => {
            this.divFps.innerHTML = this.engine.getFps().toFixed() + " fps";
            this.scene.render();
        });
    }

    private resize() {
        this.engine.setSize(window.innerWidth, window.innerHeight);
        this.engine.resize();
    }

}