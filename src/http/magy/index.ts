import { ModelType } from '../../kernel/model'
import { DefinedResolver, ResolverOptions } from './middleware'
import getMany from './resolvers/get-many'
import getOne from './resolvers/get-one'

const wrapper = <T>(model: ModelType<T>, resolver: DefinedResolver) =>
    <C>(options: ResolverOptions<T, C> = {}) => resolver<T, C>(model, options)

export default <T>(model: ModelType<T>) => ({
    getMany: wrapper(model, getMany),
    getOne: wrapper(model, getOne)
})

