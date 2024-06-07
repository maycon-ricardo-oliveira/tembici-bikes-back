# tembici-bikes-back


## Para iniciar
Antes de iniciar o projeto é necessário instalar as dependências

Não esqueça de copiar o arquivo .env.example e alterar seus valores
``` bash
cp .env.example .env
```

Execute o comando a seguir
``` bash
npm install
```

Para iniciar o servidor
``` bash
npm run dev
```

http://localhost:3030/stations/{databaseId}/{sheetName}


## Endpoints
- databaseId é o id da planilha no google sheets
- sheetName é o nome da Aba da planilha que está sendo usada

### Endpoint para buscar estações baseadas nos filtros

```{{API_URL}}/stations/{{databaseId}}/{{sheetName}}?plan=Básico&tariff=tariff&type=electric```

Todos os filtros podem ser nulos, caso sim, serão ignorados pela aplicação.

Os filtros abaixo:
* plan:Básico
* dayOfWeek:Domingo
* time:10h - 14h
* neighborhood:Itaim Bibi
* addCharge:Sim
* city:São Paulo

São exatamente os campos da planilha, eles podem receber os valores que estiverem presentes nela, não necessáriamente o front está usando, mas é possível.

Os filtros abaixo são responsáveis por calcular o preço de cada estação baseado no type, o campo na planilha *Mecanica* ou *Eletrica* é considerado para o cálculo.

- tariff:tariff `( none | fariff )`
- type:electric `( mech | electric )`

Latitude e Longitude que são capturados do dispositivo do usuário são passados para econtrar a Cidade atual do usuário e filtrar os dados baseados no campo *Cidade* na planilha.
- lat:-23.5901692
- lng:-46.6804937

### Endpoint para resetar o arquivo de cache na aplicação
```{{API_URL}}/cache/{{databaseId}}/{{sheetName}}```

Este endpoint serve para atualizar os dados que seram usados pelo front


### Endpoint para buscar estações por nome
```{{API_URL}}/stations/{{databaseId}}/Testing/search/{{term}}```

Serão usados para buscar os campos
- Nome da estação 
- Endereço
- Bairro 

