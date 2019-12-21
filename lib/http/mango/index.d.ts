import { ModelType } from '../../kernel/model';
import { ResolverHooks } from './middleware';
declare const _default: <T>(model: ModelType<T>) => {
    getMany: <C>(hooks?: ResolverHooks<T, C>) => import("../context").Middleware<any>;
    getOne: <C>(hooks?: ResolverHooks<T, C>) => import("../context").Middleware<any>;
};
export default _default;
