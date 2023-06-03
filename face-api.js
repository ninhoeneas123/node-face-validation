const cam = document.querySelector('#video')
var resumeButton = document.getElementById('resumeButton');
var addFace1Button = document.getElementById('addFace1Button');
var addFace2Button = document.getElementById('addFace2Button');
let compareFacesButton = document.getElementById('compareButton');
let faceDescriptor
let face1
let face2

let requestAnimationFrameId = null;

async function startVideo() {
    const constraints = { video: true };

    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);

        cam.srcObject = stream;
        cam.onloadedmetadata = e => {
            cam.play();
        }

    } catch (err) {
        console.error(err);
    }
}
let canvas
cam.addEventListener('play', () => {

    const canvas = faceapi.createCanvasFromMedia(video) // Criando canvas para mostrar nossos resultador
    document.body.append(canvas) // Adicionando canvas ao body

    const displaySize = { width: cam.width, height: cam.height } // criando tamanho do display a partir das dimenssões da nossa cam

    faceapi.matchDimensions(canvas, displaySize) // Igualando as dimensões do canvas com da nossa cam

    setInterval(async () => { // Intervalo para detectar os rostos a cada 100ms
        const detections = await faceapi.detectAllFaces(
            cam, // Primeiro parametro é nossa camera
            new faceapi.TinyFaceDetectorOptions() // Qual tipo de biblioteca vamos usar para detectar os rostos

        )
            .withFaceLandmarks() // Vai desenhar os pontos de marcação no rosto
            .withFaceExpressions() // Vai determinar nossas expressões


        const resizedDetections = faceapi.resizeResults(detections, displaySize) // Redimensionado as detecções


        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height) // Apagando nosso canvas antes de desenhar outro

        faceapi.draw.drawDetections(canvas, resizedDetections) // Desenhando decções
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections) // Desenhando os pontos de referencia
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // Desenhando expressões

        faceDescriptor = await faceapi.computeFaceDescriptor(cam, detections.landmarks);


    }, 100);
})



async function initValidation() {
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'), // É igual uma detecção facial normal, porém menor e mais rapido
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // Pegar os pontos de referencia do sue rosto. Ex: olhos, boca, nariz, etc...
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // Vai permitir a api saber onde o rosto está localizado no video
        faceapi.nets.faceExpressionNet.loadFromUri('/models'), // Vai permitir a api saber suas expressões. Ex: se esta feliz, triste, com raiva, etc...

    ]).then(startVideo)

}

async function addface1() {
    face1 = faceDescriptor
    console.log("face1", face1)
}

async function addface2() {
    face2 = faceDescriptor
    console.log("face 2", face2)
}


function comparationFaces(face1, face2) {
    if(!face1) return alert("Adicione a primeira face")
    if(!face2) return alert("Adicione a segunda face")
    
    const distance = faceapi.euclideanDistance(face1, face2);
    console.log("distance", distance)

    const similarityThreshold = 0.2;

    if (distance < similarityThreshold) {
        alert('As faces são iguais.');
    } else {
        alert('As faces são diferentes.');
    }
}

function compareFaces(){
    const face1ForComparation = face1
    const face2ForComparation = face2

    comparationFaces(face1ForComparation, face2ForComparation)


}



function pauseDetection() {
    clearInterval(initValidation);
}

function resumeDetection() {
    face1 = null
    face2 = null
    console.log("face1", face1, "face2", face2)

}

resumeButton.addEventListener('click', resumeDetection);
addFace1Button.addEventListener('click', addface1);
addFace2Button.addEventListener('click', addface2);
compareFacesButton.addEventListener('click', compareFaces);

initValidation();