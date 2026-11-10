import {DemoWorkspace} from "@/components/admin/demo-workspace";
type ModuleKey="customers"|"orders"|"points"|"wallet"|"ledger"|"reconciliation"|"settlements"|"stores";
export function DemoModulePage({module}:{module:ModuleKey}){return <DemoWorkspace module={module}/>;}
