import fs from 'node:fs/promises'
import path from 'node:path'
import { DuplicateResourceError } from '../shared/errors/DuplicateResourceError.js'

export class ProductModel {
  constructor({ db }) {
    this.db = db
  }

  async #readProducts() {
    try {
      const filePath = path.join(process.cwd(), 'infrastructure', this.db.products)
      const data = await fs.readFile(filePath, 'utf-8')
      
      // Remove comments and extract JSON array
      const lines = data.split('\n')
      const jsonLines = lines.filter(line => !line.trim().startsWith('//'))
      const jsonString = jsonLines.join('\n').trim()
      
      // If the file starts with [, it's already JSON
      if (jsonString.startsWith('[')) {
        return JSON.parse(jsonString)
      }
      
      // Otherwise, try to extract array from module format
      const jsonData = jsonString.replace(/^.*\[/, '[').replace(/\].*$/, ']')
      return JSON.parse(jsonData)
    } catch (error) {
      console.error('Error reading products file:', error)
      return []
    }
  }

  async #writeProducts(products) {
    try {
      const filePath = path.join(process.cwd(), 'infrastructure', this.db.products)
      const formattedData = `// filepath: ${filePath}\n${JSON.stringify(products, null, 2)}`
      await fs.writeFile(filePath, formattedData, 'utf-8')
    } catch (error) {
      console.error('Error writing products file:', error)
      throw error
    }
  }

  async getAll({ disponible } = {}) {
    const products = await this.#readProducts()
    
    if (disponible !== undefined) {
      const isAvailable = disponible === 'true' || disponible === true
      return products.filter(product => product.disponible === isAvailable)
    }
    
    return products
  }

  async getById({ id }) {
    const products = await this.#readProducts()
    const productId = parseInt(id)
    return products.find(product => product.id === productId)
  }

  async getAvailable() {
    const products = await this.#readProducts()
    return products.filter(product => product.disponible === true)
  }

  async create({ input }) {
    const products = await this.#readProducts()
    
    // Check for duplicate product name
    const existingProduct = products.find(product => 
      product.nombre.toLowerCase() === input.nombre.toLowerCase()
    )
    
    if (existingProduct) {
      throw new DuplicateResourceError(`Ya existe un producto con el nombre '${input.nombre}'`)
    }

    // Generate new ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
    
    // Create new product with current timestamp
    const newProduct = {
      id: newId,
      ...input,
      fecha_ingreso: new Date().toISOString()
    }

    products.push(newProduct)
    await this.#writeProducts(products)
    
    return newProduct
  }

  async update({ id, input }) {
    const products = await this.#readProducts()
    const productId = parseInt(id)
    const productIndex = products.findIndex(product => product.id === productId)
    
    if (productIndex === -1) {
      return null
    }

    // Check for duplicate product name (excluding current product)
    if (input.nombre) {
      const existingProduct = products.find(product => 
        product.nombre.toLowerCase() === input.nombre.toLowerCase() && 
        product.id !== productId
      )
      
      if (existingProduct) {
        throw new DuplicateResourceError(`Ya existe un producto con el nombre '${input.nombre}'`)
      }
    }

    // Update product
    const updatedProduct = {
      ...products[productIndex],
      ...input
    }

    products[productIndex] = updatedProduct
    await this.#writeProducts(products)
    
    return updatedProduct
  }

  async delete({ id }) {
    const products = await this.#readProducts()
    const productId = parseInt(id)
    const productIndex = products.findIndex(product => product.id === productId)
    
    if (productIndex === -1) {
      return false
    }

    products.splice(productIndex, 1)
    await this.#writeProducts(products)
    
    return true
  }
}