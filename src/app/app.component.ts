import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Carta } from './models/carta.model';
import { CARTAS } from './models/cartas-mock';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  TEMPO = 300;

  cartas: Array<Carta> = [];  
  primeiraCarta: Carta;
  segundaCarta: Carta;
  primeiraCartaVirada: boolean = true;
  travarCartas:boolean = false;
  jogadas: number = 0;  
  tempoInicial: number = this.TEMPO;
  tempoRestante: number = this.TEMPO;
  pontuacao: string = '';
  contagem: Subscription;
  fimDeJogo: boolean = false;
  fimDeJogoMsg: string = '';
  
  
  ngOnInit(): void {          
    this.cartas = CARTAS.concat(CARTAS.map(carta => ({...carta})));
    this.embaralhaCartas();   
    this.iniciarContagem(); 
  }
  
  ngOnDestroy(): void {
    this.pararContagem();
  }

  //----------------------------------------------------------  
  iniciarContagem(): void { 
    const geradorNumeros = interval(1000);

    this.contagem = geradorNumeros.subscribe( x => {
      this.tempoRestante = this.tempoInicial - x;
      if(this.tempoRestante < 0) {        
        this.gameOver(false);
      }
    });
  }

  //----------------------------------------------------------  
  pararContagem(): void {    
    this.contagem.unsubscribe();
  }

  //----------------------------------------------------------  
  gameOver(ganhou: boolean): void {
    this.pararContagem(); 
    
    if (ganhou) 
      this.fimDeJogoMsg = 'Você ganhou! =D';
    else
      this.fimDeJogoMsg = 'Você perdeu... =(';

    this.fimDeJogo = true;
    this.travarCartas = true;
  }


  //----------------------------------------------------------  
  reiniciarJogo() {
    this.pararContagem();    
    this.travarCartas = true;
    this.jogadas = 0;
    this.tempoInicial = this.TEMPO;
    this.tempoRestante = this.TEMPO;
    this.fimDeJogo = false;
    
    this.cartas.forEach(carta => carta.estaVirada = false);
    this.primeiraCartaVirada = true;
    
    setTimeout(() => {      
      this.embaralhaCartas();       
      this.travarCartas = false;
      this.iniciarContagem();
    }, 1500);
  }


  //----------------------------------------------------------  
  embaralhaCartas(): void {
    const qtdItens = this.cartas.length;

    for (let i = qtdItens - 1; i >= 0; i--) {
      let j = Math.floor(Math.random() * qtdItens);
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  }


  //----------------------------------------------------------
  viraCarta(carta: Carta): void {
    
    if(this.fimDeJogo)
      return

    if(carta.estaVirada)
      return;
    
    carta.estaVirada = true;    

    if(this.primeiraCartaVirada) {
      this.jogadas++;
      this.primeiraCarta = carta;
      this.primeiraCartaVirada = false;
    }
    else {            
      this.primeiraCartaVirada = true;
      this.segundaCarta = carta;
      this.travarCartas = true;
      this.comparaCartas();
    }
  }


  //----------------------------------------------------------  
  desviraCartas(): void {
    setTimeout(() => {
      if(!this.fimDeJogo) {
        this.primeiraCarta.estaVirada = false;
        this.segundaCarta.estaVirada = false;
        this.travarCartas = false;
      }
    }, 1500);
  }


  //----------------------------------------------------------  
  comparaCartas(): void {
    if(this.primeiraCarta.id === this.segundaCarta.id) {  
      this.travarCartas = false;        
      this.atualizarPontuacao(+10);

      if(this.cartas.some(carta => carta.estaVirada === false)) {
        return;
      }
      else {
        this.gameOver(true);
        return;
      }
    }
    
    this.atualizarPontuacao(-10);
    
    this.desviraCartas();
  }

  //----------------------------------------------------------  
  atualizarPontuacao(pontos: number): void {
    this.tempoInicial += pontos;

    if(pontos > 0)
      this.pontuacao = `+${pontos} segundos!`;
    else
      this.pontuacao = `${pontos} segundos!`;

    setTimeout(() => this.pontuacao = '', 2000);
  }
}
