let itemArray = [
    {title: "Neo"}, 
    {title: "Morpheus"}, 
    {title: "Trinity"}, 
    {title: "Cypher"}, 
    {title: "Tank"},
];

// eslint-disable-next-line no-unused-vars
function findItems_(itemsArray, titleArray, searchKey) {
    return itemsArray(titleArray.indexOf(searchKey));
}

function getTitleArray_(itemsArray) {
    let titleArray = [];
    let length = itemsArray.length;
    for(let i = 0; i < length; i++){
        titleArray.push(itemsArray[i].title);
        console.log(itemsArray[i].title);
    }
    return titleArray;
}

getTitleArray_(itemArray);