import {Event, IEvent} from "@appolo/events/index";
import {IDefinition} from "../interfaces/IDefinition";

export type InjectEvent = { instance: any, definition: IDefinition }

export class Events {
    public readonly instanceOwnInitialized: IEvent<InjectEvent> = new Event();
    public readonly instanceInitialized: IEvent<InjectEvent> = new Event();

    public readonly instanceOwnCreated: IEvent<InjectEvent> = new Event();
    public readonly instanceCreated: IEvent<InjectEvent> = new Event();

    public readonly beforeInitialize: IEvent<void> = new Event();

    public readonly beforeInitDefinitions: IEvent<void> = new Event();
    public readonly beforeInitFactories: IEvent<void> = new Event();
    public readonly beforeInitInstances: IEvent<void> = new Event();
    public readonly beforeInitProperties: IEvent<void> = new Event();

    public readonly beforeInitMethods: IEvent<void> = new Event();
    public readonly beforeBootstrapMethods: IEvent<void> = new Event();
    public readonly afterInitialize: IEvent<void> = new Event();

}
