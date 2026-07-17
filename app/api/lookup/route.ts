import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  // Si aucune IP n'est fournie, on check l'IP du client qui fait la requête
  const targetIp = ip || '';

  try {
    // On active l'option security=1 pour récupérer les flags VPN/Proxy/Tor
    const response = await fetch(`https://ipwho.is/${targetIp}?security=1`, {
      cache: 'no-store' // Évite de mettre en cache les requêtes de dev
    });
    
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