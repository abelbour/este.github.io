import jsonata from "jsonata";

const jsonataQuery = `$.values.{
    "Día": $[0],
    "Hora": $[1],
    "PuntoDeEncuentro": $[2],
    "Grupos": $split($[3], ", "),
    "Conductor": $[4],
    "Territorios": $eval('[' & $[5] & ']'),
    "Comentarios": $[6] != "" ? $[6] : undefined,
    "Publicar": ($[7] = "Publicar"),
    "DiaNum": $eval($[8])
  }[Publicar = true]`;
//TODO: Put in .env file
const url = 'https://sheets.googleapis.com/v4/spreadsheets/1g6ZP3QrlF95YaaN21-wCeXY2h05D7VK7nYAXvOehdtA/values/salidas?alt=json&key=AIzaSyCz4sutc6Z6Hh5FtBTB53I8-ljkj6XWpPc';

export default function useCasaEnCasaApi(){

    async function fetchData(){
        const response = await fetch(url);
        const jsonData = await response.json();
        const expression = jsonata(jsonataQuery);
        const result = await expression.evaluate(jsonData);
        return result;
    }

    return {
        fetchData
    }

}