const { Client } = require('@notionhq/client');

const notion = new Client({ auth: 'secret_LEypnFxjdTrEr4otOYG6S9x2TaMLWQZ0u7rb7JIKJW1' });
const testingDatabaseId = 'f5574781ad2e4d5e85990658c3803c5c';

async function getPage() {
  const pageId = '1fc76e427a2a48e8af489177ffb2d2fb';
  const response = await notion.pages.retrieve({ page_id: pageId });
  console.log(response);
  return response;
};

const filters = {
  neighborhoodFilterOptions: null,
  planFilterOptions: null,
  dayOfWeekFilterOptions: null,
  timeFilterOptions: null,
  addChargeFilterOptions: null
}

// okay
async function getDatabaseFilters() {
  const databaseId = testingDatabaseId;
  const response = await notion.databases.retrieve({
    database_id: databaseId, 
  });

  filters.neighborhoodFilterOptions = response.properties['Bairro'].multi_select.options;
  filters.planFilterOptions = response.properties['Plano'].multi_select.options;
  filters.dayOfWeekFilterOptions = response.properties['Dia da Semana'].multi_select.options;
  filters.timeFilterOptions = response.properties['Cobrança Adicional'].multi_select.options;
  filters.addChargeFilterOptions = response.properties['Horário'].multi_select.options;

  queryDatabase()
}


async function queryDatabase() {
    const databaseId = testingDatabaseId;

    const neighborhoodOption = "";
    const planOption = "";
    const addChargeOption = "";
    const dayOfWeekOption = "";
    const timeOption = "até 10h";
    const mechanicsOption = 10;
    const eletricalOptin = 0;

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: { 
        and: [
          filterMechanics(mechanicsOption),
          filterElectrical(eletricalOptin),
          filterNeighborhood(neighborhoodOption),
          filterPlan(planOption),
          filterAddCharge(addChargeOption),
          filterDayOfWeek(dayOfWeekOption),
          filterTime(timeOption)
        ]
        
      }
    });
  response.results.forEach(element => {
    console.log(element.properties['Endereço'].rich_text[0].plain_text)
    console.log(element.properties['Bairro'].multi_select[0].name)
    console.log(element.properties['Plano'].multi_select[0].name)
    console.log(element.properties['Horário'].multi_select[0].name)
  });
}


function filterMechanics(price = 0) {
  return {
    property: 'Mecânica',
    number: {
      equals: price,
    },
  }
}

function filterElectrical(price = 0) {
  return {
    property: 'Elétrica',
    number: {
      equals: price,
    },
  }
}

function filterNeighborhood(option) {
  const neighborhoodFilterOptions = filters.neighborhoodFilterOptions;
  const isValidOption = neighborhoodFilterOptions.find(item => item.name === option);

  return {
    property: "Bairro",
    "multi_select": {
      "contains": isValidOption ? option : ''
    }
  }
}

function filterPlan(option) {
  const isValidOption = filters.planFilterOptions.find(item => item.name === option);

  return {
    property: "Plano",
    "multi_select": {
      "contains": isValidOption ? option : ''
    }
  }
}


function filterDayOfWeek(option) {
  const isValidOption = filters.dayOfWeekFilterOptions.find(item => item.name === option);

  return {
    property: "Dia da Semana",
    "multi_select": {
      "contains": isValidOption ? option : ''
    }
  }
}


function filterAddCharge(option) {
  const isValidOption = filters.addChargeFilterOptions.find(item => item.name === option);

  return {
    property: "Cobrança Adicional",
    "multi_select": {
      "contains": isValidOption ? option : ''
    }
  }
}


function filterTime(option) {
  const isValidOption = filters.timeFilterOptions.find(item => item.name === option);

  return {
    property: "Horário",
    "multi_select": {
      "contains": isValidOption ? option : ''
    }
  }
}




// const page = getPage();

// getProperties();

getDatabaseFilters();