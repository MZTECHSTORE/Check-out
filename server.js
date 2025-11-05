.stringify({user:USER,amount:valor,currency:'USD'})});
    const j=await res.json();
    if(j.success && j.paymentUrl){
        window.open(j.paymentUrl,'_blank');
        fetchSaldo();
    } else { alert('Erro ao criar pagamento'); }
  } catch(e){ console.error(e); alert('Erro ao criar pagamento'); }
}

async function saqueVendorapay(){
  const valor=parseFloat(prompt("Digite valor USD para saque:"));
  if(!valor || valor<=0){alert('Valor inválido'); return;}
  try{
    const res=await fetch('/api/vendorapay/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user:USER,amount:valor,currency:'USD'})});
    const j=await res.json();
    if(j.success){ alert(`Saque solicitado: $${valor}`); fetchSaldo(); }
    else{ alert('Erro ao solicitar saque'); }
  } catch(e){ console.error(e); alert('Erro ao solicitar saque'); }
}

// Aviador
function startAviador(){
  if(aviadorActive) return;
  aviadorActive=true; aviadorValue=1;
  document.getElementById('aviador-bar').style.width='0%';
  document.getElementById('cashOutBtn').style.display='block';
  aviadorInterval=setInterval(()=>{
    aviadorValue+=aviadorSpeed;
    document.getElementById('aviador-bar').style.width=Math.min((aviadorValue-1)*20,100)+'%';
    if(Math.random()<0.005){
      clearInterval(aviadorInterval); aviadorActive=false;
      document.getElementById('aviador-bar').style.width='0%';
      document.getElementById('cashOutBtn').style.display='none';
      alert('Aviador terminou sem Cash Out!');
    }
  },50);
}

function cashOutAviador(){
  if(!aviadorActive) return;
  clearInterval(aviadorInterval); aviadorActive=false;
  adicionarGanho(aviadorValue-1,'Aviador x'+aviadorValue.toFixed(2));
  document.getElementById('aviador-bar').style.width='0%';
  document.getElementById('cashOutBtn').style.display='none';
}

// Roleta
function roleta(){
  const escolha=Math.floor(Math.random()*6)+1;
  const resultado=Math.floor(Math.random()*6)+1;
  const ganho=(escolha===resultado)?3:0;
  adicionarGanho(ganho,'Roleta');
  document.getElementById('wheel-number').innerText=resultado;
}

// Raspadinha
function raspadinha(){
  const chance=Math.random();
  let ganho=0;
  if(chance<0.2) ganho=5;
  else if(chance<0.5) ganho=1;
  adicionarGanho(ganho,'Raspadinha');
  document.getElementById('raspadinha-area').innerText='Raspado! +' + ganho;
  setTimeout(()=>document.getElementById('raspadinha-area').innerText='Clique para raspar',1500);
}

// Click2 / Tarefas
function ganharClick2(){
  const ganho=Math.random()*0.5;
  adicionarGanho(ganho,'Click2/Tarefa');
}

function ativarTimeToEarn(){
  if(timeToEarnAtivo) return alert('Time To Earn já ativo!');
  timeToEarnAtivo=true;
  setInterval(()=>adicionarGanho(0.01,'TimeToEarn'),1000);
  alert('Time To Earn ativado! Ganha $0.01 por segundo.');
}

// Inicializa saldo
fetchSaldo();
// Atualiza saldo e histórico a cada 10s
setInterval(fetchSaldo,10000);
</script>

</body>
</html>
