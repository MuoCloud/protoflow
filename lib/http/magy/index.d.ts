import { ModelType } from '../../kernel/model';
import { ResolverOptions } from './middleware';
declare const _default: <T>(model: ModelType<T>) => {
    getMany: <C>(options?: ResolverOptions<T, C>) => import("../context").Middleware<any>;
    getOne: <C>(options?: ResolverOptions<T, C>) => import("../context").Middleware<any>;
};
export default _default;
