import { NextResponse } from 'next/server';
import { authenticated } from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 try {return NextResponse.json({authenticated:await authenticated(request)},{headers:{'Cache-Control':'no-store'}});}
 catch {return NextResponse.json({authenticated:false},{headers:{'Cache-Control':'no-store'}});}
}
