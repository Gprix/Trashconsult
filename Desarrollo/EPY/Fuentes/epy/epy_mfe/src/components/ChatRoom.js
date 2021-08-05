import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import Cookies from 'js-cookie';

import Mensaje from './Chat/Mensaje';

var csrfCookie = Cookies.get('csrftoken')

export default function ChatRoom() {
    let params = useParams();

    const [data, setData] = useState([]);
    const [user, setUser] = useState([]);
    const [sesion, setSesion] = useState([]);
    const [peer, setPeer] = useState([]);

    const [mensaje, setMensaje] = useState([]);

    const obtenerMensajes = (sessionKey) => {
        axios.get('/api/mensajes')
            .then(res => {
                let mensajesRaw = res.data;
                // console.log(mensajesRaw);
    
                // Obtener mensajes de la sesion con ese id_key
                let mensajesFiltrados = mensajesRaw.filter(mensaje => {
                    return mensaje.sesion.id_key == sessionKey
                });
    
                setData(mensajesFiltrados);
            });
    }

    const obtenerSesion = (sessionKey) => {
        axios.get('/api/crear-sesion')
            .then(res => {
                let sesionRaw = res.data;
                
                let sesionArr = sesionRaw.filter(sesion => {
                    return sesion.id_key == sessionKey
                });

                setSesion(sesionArr[0]);
            });
    }

    const obtenerPeer = (sessionKey) => {
        axios.get('/api/obtener-usuario')
            .then(res => {
                let us = res.data;

                axios.get('/api/crear-sesion')
                    .then(resp => {
                        let raw = resp.data;
                        let ses = raw.filter(s => s.id_key == sessionKey)[0];

                        let sPeer = ses.participantes.filter(p => p.id != us.id)[0];

                        setPeer(sPeer);
                    })
            })
    }

    const obtenerUsuario = () => {
        axios.get('/api/obtener-usuario')
            .then(res => {
                // console.log(res.data);
                setUser(res.data);
            })
    }

    const handleInput = (event) => {
        setMensaje(event.target.value);
    }

    const enviarMensaje = (event) => {
        event.preventDefault();

        if(mensaje.trim().length === 0){
            // console.log("no puedes enviar vacio")
            return;
        }

        axios.post('/api/mensajes/', {
            "contenido": mensaje,
            "sesion": sesion.id,
            "autor": user.id
        },{
            headers: {
                'X-CSRFTOKEN': csrfCookie,
            }
        })
            .then(res => {
                // console.log(res);
                setMensaje("");

                obtenerMensajes(params.id_key);
            })
    }

    const actualizar = (ms) => {
        setInterval(function(){
            obtenerMensajes(params.id_key);
            // console.log("Actualizado!");
        }, ms)
    }

    useEffect(()=>{
        obtenerUsuario();
        obtenerSesion(params.id_key);
        obtenerMensajes(params.id_key);
        obtenerPeer(params.id_key);
        actualizar(1000);
    }, []);

    return (
        <div className="card my-4">
            <div className="selected-user">
                <span className="name">Asunto: {sesion.asunto}</span>
            </div>
            <div className="chat-container">
                <ul className="chat-box chatContainerScroll" style={{ minHeight: '350px', }}>
                    <li className="text-center">Has iniciado una sesión con {`${peer.first_name} ${peer.last_name}`}</li>
                    {data.map(mensaje => (
                        <Mensaje
                            key={mensaje.id}
                            mensaje={mensaje.contenido}
                            propio={mensaje.autor.id === user.id ? true : false}
                            timestamp={mensaje.timestamp}
                            autor={mensaje.autor}
                        />
                    ))}
                </ul>
                <hr />
                <form onSubmit={enviarMensaje} className="bg-light">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Escribir mensaje"
                            className="form-control rounded-0 border-0 py-2 bg-light"
                            value={mensaje}
                            onInput={handleInput}
                        />
                        <div className="input-group-append">
                            <button id="button-addon2" type="submit" className="btn btn-link"> <i className="fa fa-paper-plane" /></button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
