//
// Script that generates r-trees for countries and cities.
// run with npx babel-node prepare-rtree.js
//

import fs from 'fs';
import path from 'path';
import geojsonRbush from 'geojson-rbush';

import countriesJSON from './countries.geo.json';
import citiesJSON from './cities.geo.json';

const outputPaths = {
  countries: path.join(__dirname, 'countries.rbush.json'),
  cities: path.join(__dirname, 'cities.rbush.json')
};

const countryRbush = geojsonRbush();
countriesJSON.features.map(feat => countryRbush.insert(feat));
fs.writeFileSync(outputPaths.countries, JSON.stringify(countryRbush.toJSON()));
console.log(`Saved an rbush: ${outputPaths.countries}`);

const cityRbush = geojsonRbush();
citiesJSON.features.map(feat => cityRbush.insert(feat));
fs.writeFileSync(outputPaths.cities, JSON.stringify(cityRbush.toJSON()));
console.log(`Saved an rbush: ${outputPaths.cities}`);
