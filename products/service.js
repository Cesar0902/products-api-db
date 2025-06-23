import { DuplicateResourceError } from '../shared/errors/DuplicateResourceError.js'
import { validateProduct, validatePartialProduct } from './schema.js'

export class ProductService {
  constructor ({ productModel }) {
    this.productModel = productModel
  }

  async getAllProducts ({ disponible } = {}) {
    const products = await this.productModel.getAll({ disponible })
    
    return {
      success: products.length > 0,
      data: products,
      message: this._getMessageForProductList(products, disponible)
    }
  }

  async getProductById (id) {
    const product = await this.productModel.getById({ id })

    if (!product) {
      return {
        success: false,
        data: null,
        message: `No se encontró el producto con ID ${id}`
      }
    }

    return {
      success: true,
      data: product,
      message: `Se ha encontrado el producto '${product.nombre}'`
    }
  }

  async getAvailableProducts () {
    const products = await this.productModel.getAvailable()
    
    return {
      success: products.length > 0,
      data: products,
      message: products.length > 0 
        ? 'Productos disponibles encontrados' 
        : 'No se han encontrado productos disponibles'
    }
  }

  async createProduct (productData) {
    // Validación de datos
    const validationResult = validateProduct(productData)

    if (!validationResult.success) {
      const issues = validationResult.error.issues.map(issue => ({
        field: issue.path[0],
        message: issue.message,
        received: issue.received
      }))

      return {
        success: false,
        data: null,
        message: 'Error de validación',
        errors: issues,
        statusCode: 400
      }
    }

    try {
      const newProduct = await this.productModel.create({ input: validationResult.data })

      return {
        success: true,
        data: newProduct,
        message: 'Producto creado exitosamente',
        statusCode: 201
      }
    } catch (error) {
      if (error instanceof DuplicateResourceError) {
        return {
          success: false,
          data: null,
          message: 'No se pudo guardar el producto',
          errors: [{ field: 'nombre', message: error.message }],
          statusCode: error.statusCode
        }
      }

      console.error('Error interno al crear producto:', error)
      return {
        success: false,
        data: null,
        message: 'Error interno al crear el producto.',
        error: error.code || 'UNKNOWN_ERROR',
        statusCode: 500
      }
    }
  }

  async updateProduct (id, productData) {
    // Validación de datos
    const validationResult = validatePartialProduct(productData)

    if (!validationResult.success) {
      const issues = validationResult.error.issues.map(issue => ({
        field: issue.path[0],
        message: issue.message,
        received: issue.received
      }))

      return {
        success: false,
        data: null,
        message: 'Error de validación',
        errors: issues,
        statusCode: 400
      }
    }

    try {
      const updatedProduct = await this.productModel.update({ id, input: validationResult.data })

      if (!updatedProduct) {
        return {
          success: false,
          data: null,
          message: 'Producto no encontrado',
          statusCode: 404
        }
      }

      return {
        success: true,
        data: updatedProduct,
        message: 'Producto actualizado exitosamente',
        statusCode: 200
      }
    } catch (error) {
      console.error('Error interno al actualizar producto:', error)
      return {
        success: false,
        data: null,
        message: 'Error interno al actualizar el producto.',
        error: error.code || 'UNKNOWN_ERROR',
        statusCode: 500
      }
    }
  }

  async deleteProduct (id) {
    const result = await this.productModel.delete({ id })

    if (result === false) {
      return {
        success: false,
        message: 'Producto no encontrado',
        statusCode: 404
      }
    }

    return {
      success: true,
      message: 'Producto eliminado exitosamente',
      statusCode: 200
    }
  }

  // Método privado para generar mensajes apropiados
  _getMessageForProductList (products, disponible) {
    if (products.length === 0) {
      return disponible ? 'No se han encontrado productos disponibles' : 'No se han encontrado productos'
    }
    return disponible ? 'Productos disponibles encontrados' : 'Productos encontrados'
  }
}