import { ProductService } from './service.js'

export class ProductController {
  constructor ({ productModel }) {
    this.productService = new ProductService({ productModel })
  }

  getAll = async (req, res) => {
    const { disponible } = req.query
    const result = await this.productService.getAllProducts({ disponible })

    const statusCode = result.success ? 200 : 200
    res.status(statusCode).json(result)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const result = await this.productService.getProductById(id)

    const statusCode = result.success ? 200 : 404
    res.status(statusCode).json(result)
  }

  getAvailable = async (req, res) => {
    const result = await this.productService.getAvailableProducts()

    res.status(200).json(result)
  }

  create = async (req, res) => {
    const result = await this.productService.createProduct(req.body)

    res.status(result.statusCode).json({
      success: result.success,
      data: result.data,
      message: result.message,
      ...(result.errors && { errors: result.errors }),
      ...(result.error && { error: result.error })
    })
  }

  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.productService.deleteProduct(id)

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message
    })
  }

  update = async (req, res) => {
    const { id } = req.params
    const result = await this.productService.updateProduct(id, req.body)

    res.status(result.statusCode).json({
      success: result.success,
      data: result.data,
      message: result.message,
      ...(result.errors && { errors: result.errors }),
      ...(result.error && { error: result.error })
    })
  }
}
