import fsPromises from 'fs/promises'
import templates from './templates/index.js' 
import Util from './util.js'

const defaultDependencies = (layer, componentName) => {
    const dependencies = {
        repository: [],
        service: [
            `${componentName}Repository`
        ],
        factory: [
            `${componentName}Repository`,
            `${componentName}Service`
        ]
    }   

    return dependencies[layer].map(Util.lowerCaseFirstLetter)
}

async function executeWrites(pendingFilesToWrite) {
    return Promise.all (pendingFilesToWrite.map(
        ({ fileName, txtFile }) => fsPromises.writeFile(fileName, txtFile)
    ))
}

export async function createFiles({ mainPath, defaultMainFolder, layers, componentName }) {
    const keys = Object.keys(templates)

    const pendingFilesToWrite = []
    
    for(const layer of layers) {
        const chosenTemplate = keys.find(key => key.includes(layer))

        if(!chosenTemplate) {
            return { error: 'The chosen layer doesnt have a template' }   
        }

        const template = templates[chosenTemplate]
        const targetFolder = `${mainPath}/${defaultMainFolder}/${layer}`
        const dependencies = defaultDependencies(layer, componentName)
        const { fileName, template: txtFile } = template(componentName, ...dependencies)
        
        const finalFileName = `${targetFolder}/${Util.lowerCaseFirstLetter(fileName)}.js`
        pendingFilesToWrite.push({ fileName: finalFileName, txtFile })
    }

    await executeWrites(pendingFilesToWrite)

    return { success: true }
}