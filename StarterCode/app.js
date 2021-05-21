// python -m http.server
//Ctrl + Shift + R to refresh local Host

function init() {
    // allocating the dropdown menu and selection of individual names
    // selecting the dropdown element from html
    var testSubjectID = d3.select('#selDataset');

    // Use D3 to read json
    d3.json("samples.json").then(function(samplesJson){
        // reference names from json file
        var names = samplesJson.names;
        // for each id found append to html area to make drop down list of ids
        // key connecting component in json is id
        names.forEach((id) => {
            testSubjectID.append("option").property("value",id).text(id);
        })
    

        // use the first name/id as default to load traces upon start up
        var initSample = names[0];

        // Call other functions and trace charts for default id
        barPlot(initSample);
        bubblePlot(initSample);
        DemographicInfo(initSample);
        guageChart(initSample);
       

    });
};

// optionChanged in HTML with this.value set the value in selDataset on change 
// create function that reference/filtered this new id to plot all charts when selected
function optionChanged(newData){
    barPlot(newData);
    bubblePlot(newData);
    DemographicInfo(newData);
    guageChart(newData);
};

//Create a horizontal bar chart with a dropdown menu to display the top 10 OTUs found in that individual.
// create function based on id from json
function barPlot(id) {
    // Reading in the json dataset
    d3.json("samples.json").then(function(samplesJson){
        console.log(samplesJson);
        // Filtering for the id
        var filtered = samplesJson.samples.filter(sample => sample.id == id);
        var result = filtered[0];
        console.log(filtered)
        console.log(result)

        // for the id a create list and storing the otu_ids, sample_values, otu_labels from the json array
        data = [];
        // iterate over all of the sample values and return otu_ids, sample_values, otu_labels to push to data list
        for (i=0; i<result.sample_values.length; i++)for (i=0; i<result.sample_values.length; i++){
            data.push({
                id: `OTU ${result.otu_ids[i]}`,
                value: result.sample_values[i],
                label: result.otu_labels[i]
            });
        }
        console.log(data);

        // create a variable slicing data list for top 10 and sorting data (reverse for descending order) for chart
        var cleanedData = data.sort(function sortFunction(a,b){
            return b.value - a.value;
        }).slice(0,10).reverse();
        console.log(cleanedData)

        // Trace for Horizontal Bar Chart
        // trace by using map to calls each element in the cleanedData array
        var traceBar = {
            type: "bar",
            orientation: 'h',
            x: cleanedData.map(item => item.value),
            y: cleanedData.map(item => item.id),
            text: cleanedData.map(item => item.label),
            mode: 'markers',
          };
        
        var Bardata = [traceBar];
          
        var Barlayout = {
            title: `Top 10 OTUs for Subject ${id}`,
            xaxis: {autorange: true, title: 'Sample Values'},
            yaxis: {autorange: true},
            width: 500,
            height: 500
            
          };
        
        // Creating the Horizontal Bar Chart
        Plotly.newPlot("bar", Bardata, Barlayout);
        });}    


//Create a bubble chart that displays each sample.
function bubblePlot(id) {
    // Reading in the json dataset
    d3.json("samples.json").then(function(samplesJson){
        console.log(samplesJson);
        // Filtering for the id selected
        var filtered = samplesJson.samples.filter(sample => sample.id == id);
        // use result to plot
        var result = filtered[0];

    
    var bubbleTrace = {
        // Use `otu_ids` for the x values
        x: result.otu_ids,
        // Use `sample_values` for the y values.
        y: result.sample_values,        
        //Use `otu_labels` for the text values.
        text: result.otu_labels,
        mode: 'markers',
        marker: {//Use `sample_values` for the marker size.
            size: result.sample_values,
            //Use `otu_ids` for the marker colors.
            color: result.otu_ids,
            colorscale: 'Jet'
        }
        };
              
    var Bubbledata = [bubbleTrace];
              
    var layout = {
        title: `Bubble Chart for Subject ${id}`,
        showlegend: false,
        height: 500,
        width: window.width
        };
              
         Plotly.newPlot("bubble", Bubbledata, layout);

    })}

//Display the sample metadata, i.e., an individual's demographic information.
function DemographicInfo(id) {
    // import the data from json
    d3.json('samples.json').then(function(samplesJson){
         // Filtering for metadata instead of names this time
         var filtered = samplesJson.metadata.filter(sample => sample.id == id);
         var result = filtered[0];
         // Selecting the Demographic Info on the html page
         var demographicInfo = d3.select('#sample-metadata');
        
        // Clear any data already present
        demographicInfo.html('');

         //append filtered info to area h5
         Object.entries(result).forEach(([key, value]) => {
            console.log(key,value)
            demographicInfo.append("h5").text(`${key}:${value}`);
            
        });   
    })}           


//Weekly Washing Frequency Gauge

function guageChart(id) {
    // import the data from json
    d3.json('samples.json').then(function(samplesJson){
         // Filtering for metadata instead of names as it has wfreq
         var filtered = samplesJson.metadata.filter(sample => sample.id == id);
         var result = filtered[0];

         var data = [
            {
              domain: { x: [0, 5], y: [0, 1] },
              value: result.wfreq,
              title: { text: `Belly Button Washing Frequency for ${id}`
            },
              type: "indicator",
              mode: "gauge+number+delta",
              delta: { reference: 6 }, //set delta as 6 for desired washing habbits and benchmark  
              gauge: {
                axis: { range: [null, 10] },
                steps: [// set range and color for visuals
                  { range: [0, 2], color: "#FF8A65" },  
                  { range: [2, 4], color: "#FFD54F" },
                  { range: [4, 6], color: "#DCE775" },
                  { range: [6, 8], color: "#AED581" },
                  { range: [8, 10], color: "#81C784" }
                ],
                threshold: {
                  line: { color: "red", width: 4 },
                  thickness: 0.75,
                  value: 6
                }
              }
            }
          ];
          
          // Plot guage chart
          var layout = { width: 600, height: 450, margin: { t: 0, b: 0 }, paper_bgcolor: "",
          font: { color: "darkblue", family: "Arial" }};
          Plotly.newPlot('gauge', data, layout);
          

})}




init();
