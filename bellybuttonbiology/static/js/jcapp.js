console.log("hello app!");

// global variables
var snames = [];    // var to hold samples.json names array
var smetadata = []; // var to old samples.json meta-data array
var samples = [];   // var to hold samples.json samples array
var otuSampleObjs = []; // var to hold samples objects created by getOTUSampleObjects() 

// build select options
function buildSelect() {
    console.log("*** buldSelect() ***")
    var select = d3.select("#selDataset");
    // console.log("snames: ", snames);
    snames.forEach(name => {
        // console.log(name);
        var option = select.append("option").text(name);
        option.attr("value", name);

    })

    // build the plots for the first selections
    optionChanged()

}

// Select onchange element handler
// https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onchange
function optionChanged() {
    // Prevent the page from refreshing
    //d3.event.preventDefault();
  
    // Select the input value from the form
    var subject = d3.select("#selDataset").property("value")
    console.log("selected subject: ", subject);
    
    // Build the plots with the new subject id selection
    buildPlots(subject);
}

// Build the plots for the selected subject id
function buildPlots(subjectId) {
    console.log("*** buildPlots ***")
    buildDemographics(subjectId);

    // create objects of otu samples and store in global otuSampleObjs
    otuSampleObjs = getOTUSampleObjects(subjectId);
    console.log("otuSampleObjs: ", otuSampleObjs);

    // build plots for subjec's otu smaples
    buildOTU_BarPlot(subjectId);
    buildBubblePlot(subjectId);

    buildWashGauge(subjectId);
}

function buildDemographics(id) {
    console.log("*** buildDemographics() ***");

    // filter meta data by subject id
    console.log("id: ", id);
    var filtered = smetadata.filter(subject => parseInt(subject.id) === parseInt(id));
    console.log("filtered: ", filtered);
    
    // var filtered = smetadata.filter(subject => {
    //     console.log(`id: [${id}], subject id: [${subject.id}]`);127
    //     console.log(parseInt(subject.id) === parseInt(id));
    //     return (parseInt(subject.id) === parseInt(id));
    // });

    // select and fill the metadata panel with demographics
    var panel = d3.select("#sample-metadata")
    // clear the body of the panel
    panel.html("");
    // fill the body of the panel with meta-data for the subject id
    Object.entries(filtered[0]).forEach(([key, value]) => {
        console.log(`${key}: ${value}`)
        panel.append("p").text(`${key}: ${value}`);
    });

}

// filter otu sample data by subject id
// return an array of subject objecs that combines {otu_id, sample_value, otu_label} 
// for each subject
// 
function getOTUSampleObjects(id) {
    console.log("*** getOTUSampleObjects() ***");

    // filter by the subject id
    console.log("id: ", id);
    var filtered = samples.filter(subject => parseInt(subject.id) === parseInt(id));

    // otherwise build otu object array by combining 3 arrays from fitlered sample 
    otus = filtered[0];
    console.log("OTU Object", otus);

    var sampleObjs = []
    for(i=0; i < otus.otu_ids.length; i++) {
        var otuObj =  
            {
                "otu_id" : otus.otu_ids[i], 
                "sample" : otus.sample_values[i],
                "label" : otus.otu_labels[i] 
            }
        sampleObjs.push(otuObj);
    };
    console.log("samples: ", samples);
    return(sampleObjs);
}

function buildOTU_BarPlot(id) {
    console.log("*** buildOTUBar() ***");

    // sort otu object array
    otuSampleObjs.sort((a,b) => b.sample - a.sample);
    console.log("sorted otuSamples: ", otuSampleObjs);

    // slice first 10 otu object array
    slicedData = otuSampleObjs.slice(0, 10);
    console.log("sliced otu's: ", slicedData);
    // Reverse the array to accommodate Plotly's defaults
    reversedData = slicedData.reverse();

    // creat otu box-h trace
    var trace1 = {
        x: reversedData.map(otu => otu.sample),
        y: reversedData.map(otu => `OTU ${otu.otu_id}`),
        text: reversedData.map(otu => otu.label),
        name: "OTU",
        type: "bar",
        orientation: "h"
    };

    // data
    var data = [trace1];

    // Apply the group bar mode to the layout
    var layout = {
        title: `Top 10 OTU Samples for Subject: ${id}`,
        // margin: {
        //     l: 100,
        //     r: 100,
        //     t: 100,
        //     b: 100
        // }
    };

    // Render the plot to the div tag with id "plot"
    Plotly.newPlot("bar", data, layout);
}


// Build Bubble Plot
// Use otu_ids for the x values.
// Use sample_values for the y values.
// Use sample_values for the marker size.
// Use otu_ids for the marker colors.
// Use otu_labels for the text values.
function buildBubblePlot(id) {
    console.log("*** buildBubblePlot() ***");
    var otu_ids = otuSampleObjs.map(obj => obj.otu_id);
    var sample_values = otuSampleObjs.map(obj => obj.sample);
    var labels = otuSampleObjs.map(obj => obj.label);
    var colors = otuSampleObjs.map(obj => obj.otu_id);

    var trace1 = {
        x: otu_ids,
        y: sample_values,
        text: labels,
        mode: 'markers',
        marker: {
          color: colors,
          size: sample_values
        }
      };
      
      var data = [trace1];
      
      var layout = {
        title: `OTU Samples for Subject: ${id}`,
        showlegend: false,
        // height: 600,
        // width: 600
      };
      
    //   Plotly.newPlot('bubble', data, layout);
    Plotly.react('bubble', data, layout);
}

function buildWashGauge(id) {
    console.log("*** buildWashGuage() ***"); 

    // filter meta data by subject id
    console.log("id: ", id);
    var filtered = smetadata.filter(subject => parseInt(subject.id) === parseInt(id));
    console.log("filtered: ", filtered); 

    var washfreq = filtered[0].wfreq;

    var data = [
        {
        //   domain: { x: [0, 1], y: [0, 1] },
          value: washfreq,
          title: { text: "Belly Button Wash Frequency" },
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            axis: { range: [null, 9] },
            steps: [
                { range: [0,1], color: 'rgb(200, 240, 240)' },
                { range: [1,2], color: 'rgb(190, 225, 237.5)' },
                { range: [2,3], color: 'rgb(180, 210, 235)'},
                { range: [3,4], color: 'rgb(170, 200, 232)'},
                { range: [4,5], color: 'rgb(160, 195, 230.5)' },
                { range: [5,6], color: 'rgb(150, 180, 227.5)' },
                { range: [6,7], color: 'rgb(140, 165, 225)' },
                { range: [7,8], color: 'rgb(130, 150, 222.5)' },
                { range: [8,9], color: 'rgb(120, 135, 220)' }
            ],
          }
        }
      ];
    
    var layout = { 
            // width: 600, 
            // height: 500, 
        margin: { t: 0, b: 0 } };
    Plotly.react('gauge', data, layout);

}

//read json data
d3.json("data/samples.json").then((sdata) => {
    console.log("Reading samples.json");
    console.log(sdata);

    // parse json data into parts
    snames = sdata.names;
    console.log("names: ", snames);
 
    // parse metadata
    smetadata = sdata.metadata;
    console.log("metadata: ", smetadata);

    // parse sample 
    samples = sdata.samples;
    console.log("samples: ", samples);

    // parse names and build the select options
    buildSelect();

    // build the plots for the current selection

});





console.log("goodbye app!")