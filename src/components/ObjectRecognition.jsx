import React, { useRef, useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

const ObjectRecognition = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadModel = async () => {
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (model) {
            startVideo();
        }
    }, [model]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            })
            .catch((err) => console.error("Error accessing the camera:", err));
    };

    const detectObjects = async () => {
        if (model && videoRef.current) {
            const predictions = await model.detect(videoRef.current);
            drawPredictions(predictions);
        }
    };

    const drawPredictions = (predictions) => {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        predictions.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
            ctx.font = '30px Arial'; // Increase the font size here
            ctx.fillStyle = 'red';
            ctx.fillText(
                `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
                x,
                y > 10 ? y - 5 : 10
            );
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            detectObjects();
        }, 1000);
        return () => clearInterval(interval);
    });

    useEffect(()=>{
        setTimeout(() => {
            setLoading(false);
        }, 10000);
    },[])

    return (
        <div className=''>

            {
                loading &&
                <div>
                    <img src="plane.gif" alt="" />
                </div>
            }
            
            <div style={{ position: 'relative', display: 'inline-block', fontSize: '5rem' }}>
                <video ref={videoRef} style={{ width: '100vw', height: '100vh' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, fontSize: '5rem' }} />
            </div>
        </div>
    );
};

export default ObjectRecognition;
