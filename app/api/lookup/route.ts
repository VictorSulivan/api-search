import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  let targetIp = '';

  // Si l'utilisateur a saisi une IP spécifique, on utilise celle-là
  if (ip && ip.trim() !== '') {
    targetIp = ip.trim();
  } else {
    // Sinon, on extrait l'IP du visiteur via les headers du serveur
    const reqHeaders = await headers();
    const forwardedFor = reqHeaders.get('x-forwarded-for');
    const realIp = reqHeaders.get('x-real-ip');

    if (forwardedFor) {
      // x-forwarded-for peut contenir une liste d'IP (proxy1, proxy2, client). La première est celle du client.
      targetIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      targetIp = realIp.trim();
    }
  }

  try {
    // Si on est en local (localhost), l'IP peut être '::1' ou '127.0.0.1'. 
    // ipwhois.io comprend cela et renverra les infos de ta propre IP publique si targetIp est vide.
    const url = targetIp && targetIp !== '::1' && targetIp !== '127.0.0.1'
      ? `https://ipwho.is/${targetIp}?security=1`
      : `https://ipwho.is/?security=1`;

    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { error: data.message || 'Adresse IP invalide ou introuvable.' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Impossible de contacter le service d\'intelligence IP.' }, 
      { status: 500 }
    );
  }
}