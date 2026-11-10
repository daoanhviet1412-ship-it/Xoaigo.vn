import {DemoModulePage} from "@/components/admin/demo-module-page";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
export default async function WalletPage(){
 if(process.env.VERCEL_ENV==="preview") return <DemoModulePage module="wallet"/>;
 const supabase=await createClient(); if(!supabase) return <main style={{padding:36}}>Chưa cấu hình dữ liệu.</main>;
 const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/admin/login");
 return <main style={{padding:36}}>Phân hệ ví đang chờ kết nối dữ liệu nghiệp vụ.</main>;
}