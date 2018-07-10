export default interface FluxAction {
    readonly type: string;
    readonly error?: true | undefined | null;
    readonly payload?: any;
    readonly meta?: any;
}
