/**
 * MIT License 
 * 
 * Copyright (c) 2023 Gaurish Sethia
 * Copyright (c) 2019 Medley
 * 
 * TypeScript port of https://github.com/medleyjs/router.git which i built for KingWorld (now Elysia)
 * @see https://github.com/SaltyAom/kingworld/pull/9 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { FindResult, Node, ParametricNode, Params, RouterOptions } from '@/types';

function createNode(pathPart: string, staticChildren?: any[]): Node {
	return {
		pathPart,
		store: null,
		staticChildren:
			staticChildren !== undefined
				? new Map(
						staticChildren.map((child) => [
							child.pathPart.charCodeAt(0),
							child
						])
				  )
				: null,
		parametricChild: null,
		wildcardStore: null
	}
}

function cloneNode(node: Node, newPathPart: string) {
	return {
		...node,
		pathPart: newPathPart
	}
}

function createParametricNode(paramName: string): ParametricNode {
	return {
		paramName,
		store: null,
		staticChild: null
	}
}

function defaultStoreFactory() {
	return Object.create(null)
}

export class Router {
	private _root: Node
	private _storeFactory: any

	constructor({ storeFactory }: RouterOptions = {}) {
		if (!storeFactory) {
			storeFactory = defaultStoreFactory
		} else if (typeof storeFactory === 'function') {
			const customStore = storeFactory
			storeFactory = () => {
				const store = customStore()
				if (store === null) {
					throw new Error(
						'You should return an object from the store factory function.'
					)
				}
				return store
			}
		} else {
			throw new Error(
				'The store factory should be a function that returns an object.'
			)
		}

		this._root = createNode('/')
		this._storeFactory = storeFactory
	}

	register(path: string): any {
		if (typeof path !== 'string') {
			throw new TypeError('Route path must be a string')
		}
		if (path === '' || path[0] !== '/') {
			throw new Error(
				`Invalid route: ${path}\nRoute path must begin with a "/"`
			)
		}

		const endsWithWildcard = path.endsWith('*')

		if (endsWithWildcard) {
			path = path.slice(0, -1) // Slice off trailing '*'
		}

		const staticParts = path.split(/:.+?(?=\/|$)/)
		const paramParts = path.match(/:.+?(?=\/|$)/g) || []

		if (staticParts[staticParts.length - 1] === '') {
			staticParts.pop()
		}

		let node = this._root
		let paramPartsIndex = 0

		for (let i = 0; i < staticParts.length; ++i) {
			let pathPart = staticParts[i]

			if (i > 0) {
				// Set parametric properties on the node
				const paramName = paramParts[paramPartsIndex++].slice(1)

				if (node.parametricChild === null) {
					node.parametricChild = createParametricNode(paramName)
				} else if (node.parametricChild.paramName !== paramName) {
					throw new Error(
						`Cannot create route "${path}" with parameter "${paramName}" ` +
							'because a route already exists with a different parameter name ' +
							`("${node.parametricChild.paramName}") in the same location`
					)
				}

				const { parametricChild } = node

				if (parametricChild.staticChild === null) {
					node = parametricChild.staticChild = createNode(pathPart)
					continue
				}

				node = parametricChild.staticChild
			}

			for (let j = 0; ; ) {
				if (j === pathPart.length) {
					if (j < node.pathPart.length) {
						// Move the current node down
						const childNode = cloneNode(
							node,
							node.pathPart.slice(j)
						)
						Object.assign(node, createNode(pathPart, [childNode]))
					}
					break
				}

				if (j === node.pathPart.length) {
					// Add static child
					if (node.staticChildren === null) {
						node.staticChildren = new Map()
					} else if (
						node.staticChildren.has(pathPart.charCodeAt(j))
					) {
						// Re-run loop with existing static node
						node = node.staticChildren.get(pathPart.charCodeAt(j))
						pathPart = pathPart.slice(j)
						j = 0
						continue
					}

					// Create new node
					const childNode = createNode(pathPart.slice(j))
					node.staticChildren.set(pathPart.charCodeAt(j), childNode)
					node = childNode

					break
				}

				if (pathPart[j] !== node.pathPart[j]) {
					// Split the node
					const existingChild = cloneNode(
						node,
						node.pathPart.slice(j)
					)
					const newChild = createNode(pathPart.slice(j))

					Object.assign(
						node,
						createNode(node.pathPart.slice(0, j), [
							existingChild,
							newChild
						])
					)

					node = newChild

					break
				}

				++j
			}
		}

		if (paramPartsIndex < paramParts.length) {
			// The final part is a parameter
			const param = paramParts[paramPartsIndex]
			const paramName = param.slice(1)

			if (node.parametricChild === null) {
				node.parametricChild = createParametricNode(paramName)
			} else if (node.parametricChild.paramName !== paramName) {
				throw new Error(
					`Cannot create route "${path}" with parameter "${paramName}" ` +
						'because a route already exists with a different parameter name ' +
						`("${node.parametricChild.paramName}") in the same location`
				)
			}

			if (node.parametricChild.store === null) {
				node.parametricChild.store = this._storeFactory()
			}

			return node.parametricChild.store
		}

		if (endsWithWildcard) {
			// The final part is a wildcard
			if (node.wildcardStore === null) {
				node.wildcardStore = this._storeFactory()
			}

			return node.wildcardStore
		}

		// The final part is static
		if (node.store === null) {
			node.store = this._storeFactory()
		}

		return node.store
	}

	find(url: string): FindResult | null {
		if (typeof url !== 'string') {
			throw new Error('The url should be a string.')
		}

		if (url === '' || !url.startsWith('/')) {
			return null
		}

		const queryIndex = url.indexOf('?')
		const urlLength = queryIndex >= 0 ? queryIndex : url.length

		return matchRoute(url, urlLength, this._root, 0)
	}
}

function matchRoute(
	url: string,
	urlLength: number,
	node: Node,
	startIndex: number
): any {
	const pathPart = node.pathPart
	const pathPartLen = pathPart.length
	const pathPartEndIndex = startIndex + pathPartLen

	if (pathPartLen > 1) {
		if (pathPartEndIndex > urlLength) {
			return null
		}

		if (pathPartLen < 15) {
			// Using a loop is faster for short strings
			for (let i = 1, j = startIndex + 1; i < pathPartLen; ++i, ++j) {
				if (pathPart[i] !== url[j]) {
					return null
				}
			}
		} else if (url.slice(startIndex, pathPartEndIndex) !== pathPart) {
			return null
		}
	}

	startIndex = pathPartEndIndex

	if (startIndex === urlLength) {
		// Reached the end of the URL
		if (node.store !== null) {
			return {
				store: node.store,
				params: {}
			}
		}

		if (node.wildcardStore !== null) {
			return {
				store: node.wildcardStore,
				params: { '*': '' }
			}
		}

		return null
	}

	if (node.staticChildren !== null) {
		const staticChild = node.staticChildren.get(url.charCodeAt(startIndex))

		if (staticChild !== undefined) {
			const route = matchRoute(url, urlLength, staticChild, startIndex)

			if (route !== null) {
				return route
			}
		}
	}

	if (node.parametricChild !== null) {
		const parametricNode = node.parametricChild
		const slashIndex = url.indexOf('/', startIndex)

		if (slashIndex !== startIndex) {
			// Params cannot be empty
			if (slashIndex === -1 || slashIndex >= urlLength) {
				if (parametricNode.store !== null) {
					const params: Params = {}
					params[parametricNode.paramName] = url.slice(
						startIndex,
						urlLength
					)
					return {
						store: parametricNode.store,
						params
					}
				}
			} else if (parametricNode.staticChild !== null) {
				const route = matchRoute(
					url,
					urlLength,
					parametricNode.staticChild,
					slashIndex
				)

				if (route !== null) {
					route.params[parametricNode.paramName] = url.slice(
						startIndex,
						slashIndex
					)
					return route
				}
			}
		}
	}

	if (node.wildcardStore !== null) {
		return {
			store: node.wildcardStore,
			params: {
				'*': url.slice(startIndex, urlLength)
			}
		}
	}

	return null
}