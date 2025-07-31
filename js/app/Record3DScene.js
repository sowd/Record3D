import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { Record3DVideoRenderingMode } from "./Record3DVideo.js"
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Record3DScene
{
    constructor(fov, near, far)
    {
        let self = this;
        this.mainScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();

        // Camera settings
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
        this.camera.position.x = 0.0;
        this.camera.position.y = 0.0;
        this.camera.position.z = 0.2;
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        // Camera control settings
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = true;

        // ここから変更
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        this.controls.screenSpacePanning = false; // x-z平面でのパンをより正確にするため

        // ここを追加・変更：パンの速度を10倍にする
        this.controls.panSpeed = 100; 

        this.controls.update();
        // ここまで変更

        this.pointClouds = [];

        // Init scene
        this.renderer.setClearColor(new THREE.Color(0x343a40));
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Setup resizing
        window.addEventListener( 'resize', (e) => this.onWindowResize(e), false );
        this.onWindowResize(null);

        // Setup UI
        this.options = {
            modelScale: 1.0,
            modelPointSize: 1.0,
            toggleSound: () => {
                for (let video of self.pointClouds)
                    video.toggleSound();
            },
            toggleVideo: () => {
                for (let video of self.pointClouds)
                    video.toggle();
            },
            toggleMeshPoints: () => {
                for (let video of self.pointClouds) {
                    let newRenderingMode = video.renderingMode === Record3DVideoRenderingMode.MESH ?
                                                Record3DVideoRenderingMode.POINTS : Record3DVideoRenderingMode.MESH;
                    video.switchRenderingTo(newRenderingMode);
                }
            },
            toggleBoundaryBoxEditMode: ()=>{

            }
        };
        let gui = new GUI();
        gui.add(this.options, 'modelScale').min(1).max(20).step(0.1)
            .onChange(() => {
                for (let ptCloud of self.pointClouds)
                {
                    ptCloud.setScale(self.options.modelScale);
                }
            });

        gui.add(this.options, 'modelPointSize').min(0.1).max(20).step(0.1)
            .onChange(() => {
                for (let ptCloud of self.pointClouds)
                {
                    ptCloud.setPointSize(self.options.modelPointSize);
                }
            });

        gui.add(this.options, 'toggleSound').name('Mute/Unmute');
        gui.add(this.options, 'toggleVideo').name('Play/Pause');
        gui.add(this.options, 'toggleMeshPoints').name('Render points/mesh');
        gui.add(this.options, 'toggleBoundaryBoxEditMode').name('Boundary box edit mode');

        /*
        const loader = new FBXLoader();
        loader.load('models/HallOfLight.fbx', (object) => {
            object.scale.set(0.01, 0.01, 0.01);
            object.position.set(5,-10,30);

            const scene = this.mainScene;
            scene.add(object);

            // 点光源を作成して中央に配置

            for( let x=-5;x<=5;x+=10)for( let z=-5;z<=5;z+=10){
                const r = 0xFF; // 赤は固定
                const g = Math.floor(Math.random() * 256); // 緑：0〜255
                const b = Math.floor(Math.random() * 256); // 青：0〜255

                const colorHex = (r << 16) | (g << 8) | b;
                const pointLight = new THREE.PointLight(colorHex, 50, 1000); // 色, 強度, 距離
                pointLight.position.set(x,Math.random()*100, z);
                //pointLight.position.set(0, 100, 0);
                scene.add(pointLight);

                // 光の位置が分かりやすいようにヘルパーも追加（開発用）
                const pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
                scene.add(pointLightHelper);
                //break;
            }

        }, undefined, (error) => {
            console.error('FBX読み込みエラー:', error);
        });


        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        // Zの正方向を向ける（デフォルトで面の法線は +Z なので回転不要）
        plane.position.set(0, 0, -42);

        this.mainScene.add(plane);
        */
        this.mainScene.add(new THREE.AmbientLight(0xffffff, 10));

    }

    addVideo(r3dVideo)
    {
        function applyTransToModel(obj){

            const addRotationQuaternion = new THREE.Quaternion();
            const rotDegree = -15;
            addRotationQuaternion.setFromAxisAngle(
                new THREE.Vector3(1, 0, 0), Math.PI * rotDegree / 180.0);

            obj.quaternion.multiply(addRotationQuaternion);

            const sc = 10;
            obj.scale.set(sc,sc,sc);
            obj.position.y += 5;
            obj.position.z -= 23;
        }

        this.pointClouds.push(r3dVideo);

        applyTransToModel(r3dVideo.videoObject);
        this.mainScene.add(r3dVideo.videoObject);
    }

    runloop()
    {
        this.renderer.render(this.mainScene, this.camera);
        requestAnimationFrame(() => this.runloop());
    }

    toggleSound()
    {
        for (let ptCloud of this.pointClouds)
        {
            ptCloud.toggleAudio();
        }
    }

    resizeRendererToDisplaySize()
    {
        // https://threejsfundamentals.org/threejs/lessons/threejs-responsive.html
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }

    onWindowResize(event)
    {
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
    }
}