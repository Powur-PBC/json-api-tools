import type {
  ResourceFlat,
  Resource,
  ResourceObject,
  Relationships,
} from "./resource"
import treeShake from "./util/shallowTreeShake"

// borrowed from recoil
type Primitive = boolean | number | string | null

export type Serializable =
  | Primitive
  | Readonly<{ [key: string]: Serializable }>
  | ReadonlyArray<Serializable>
  | { toJSON: () => string }

export type JsonObj = Record<string, Serializable>

export type JsonArr = ReadonlyArray<Serializable>

export type Json = JsonArr | JsonObj

export type Empty = Record<string, never>

// https://docs.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/requireatleastone?view=azure-node-latest
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Partial<Pick<T, Exclude<keyof T, K>>> & Required<Pick<T, K>>
}[keyof T]

export type DeleteKeysFrom<T, K extends number | string | symbol> = T & {
  [P in K]?: never
}

export const flattenResourceObject = <RESOURCE extends Resource>(
  resource: ResourceObject<RESOURCE>
): ResourceFlat<RESOURCE> => {
  if (resource.attributes) {
    return {
      ...resource.attributes,
      ...resource.relationships,
      id: resource.id,
      type: resource.type,
    } as ResourceFlat<RESOURCE>
  }
  throw new Error(`Resource ${resource.id} has no attributes`)
}
export const serializeResource = <
  OBJ extends JsonObj,
  RESOURCE extends Resource = {
    id: string
    type: string
    attributes: OBJ
    relationships: Relationships
  }
>(
  obj: OBJ,
  type: string,
  id: string
): ResourceObject<RESOURCE> => ({
  attributes: treeShake({
    ...obj,
    id: undefined,
    type: undefined,
  }) as DeleteKeysFrom<OBJ, `id` | `type`>,
  type,
  id,
})

// export const deserialize = <
//   DATA extends ResourceObject<Resource> | ResourceObject<Resource>[]
//   // RELATED_DICT extends Record<string, Model>,
//   // RELATED_MODELS extends ResourceObject<RELATED_DICT[keyof RELATED_DICT]>
// >(
//   doc: JsonApiDocument<DATA>
// ): RESOURCE[] => {
//   if (doc.data) {
//     if (Array.isArray(doc.data)) return doc.data.map(unpackResource)
//     return [unpackResource(doc.data)]
//   }
//   console.warn(doc.errors)

//   throw new Error(doc.errors?.[0]?.detail ?? `Invalid document`)
// }
