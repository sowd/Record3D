import * as THREE from 'three';
import {Record3DVideo,Record3DVideoRenderingMode} from "../js/app/Record3DVideo.js"
import {OfflineVideoSource} from "../js/app/video-sources/OfflineVideoSource.js"
//import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/*
// Example of setupModel
    function(pointSet){
        const obj = pointSet.videoObject;
        const addRotationQuaternion = new THREE.Quaternion();
        const rotDegree = -15;
        addRotationQuaternion.setFromAxisAngle(
            new THREE.Vector3(1, 0, 0), Math.PI * rotDegree / 180.0);
        obj.quaternion.multiply(addRotationQuaternion);

        const sc = 0.2;
        obj.scale.set(sc,sc,sc);
        obj.position.x += 0.05;
        obj.position.y += 0.9;
        obj.position.z += 0.45;
        //const c = [0.05,0.9,0.45];
        //pointSet.enableBBox([c[0]-0.1,c[1]-0.1,c[2]-0.1],[c[0]+0.1,c[1]+0.1,c[2]+0.1]);
        pointSet.disableBBox();
        pointSet.enableClipPlane(0,[-1,0,0], [1,0,0]);
        pointSet.enableClipPlane(1,[0.5,0,0], [-1,0,0]);
        pointSet.enableClipPlane(2,[0,-1.055,0], [0,1,0]);
        pointSet.toggleSound();
    }
*/

let pointClouds = [];
let myScene;
let mySetupModel;

export function init(scene,setupModel=null){
    myScene = scene;
    mySetupModel = setupModel;
    setupDragDrop();

    document.getElementById('info').remove();
}

function setupDragDrop(){
    function setupGlobalFileDrop(onFilesDropped) {
        // ページ全体のイベントを抑制（これがないとブラウザがファイルを開こうとする）
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            window.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // drop時の処理
        window.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              onFilesDropped(files);
            }
        });
    }

    // ファイル受け取り時の処理
    function handleDroppedFiles(files) {
        // Should check file type
        /*
        for (const file of files) {
            console.log('ドロップされたファイル:', file.name);
            if (file.type.startsWith("text/")) {
                const reader = new FileReader();
                reader.onload = () => console.log('内容:\n', reader.result);
                reader.readAsText(file);
            }
        }
        */

        let offlineVideo = new OfflineVideoSource();
        offlineVideo.load(files[0]);

        const r3dVideo = new Record3DVideo(offlineVideo);
        pointClouds.push(r3dVideo);
        if( mySetupModel != null )
            mySetupModel(r3dVideo);

        myScene.add(r3dVideo.videoObject);
    }

    // 使用開始
    setupGlobalFileDrop(handleDroppedFiles);
}
/*
function toggleSound() // Mute/Unmute
    {    for (let video of self.pointClouds) video.toggleSound();  }
function toggleVideo() // Play/Pause
    {    for (let video of self.pointClouds) video.toggle();  }
function toggleMeshPoints() // Render points/mesh
{
    for (let video of pointClouds) {
        let newRenderingMode = video.renderingMode === Record3DVideoRenderingMode.MESH ?
                                    Record3DVideoRenderingMode.POINTS : Record3DVideoRenderingMode.MESH;
        video.switchRenderingTo(newRenderingMode);
    }
}

function setModelScale(scale)
    {    for (let ptCloud of pointClouds) ptCloud.setScale(scale);  }

function setPointSize(size)
    {    for (let ptCloud of pointClouds) ptCloud.setPointSize(size);  }
*/
/*
function loadFBXModel(fbxFilePath = 'models/HallOfLight.fbx') {
    const loader = new FBXLoader();
    loader.load(fbxFilePath, (object) => {
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
}
    */