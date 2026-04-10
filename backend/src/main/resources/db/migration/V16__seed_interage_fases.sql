-- V16__seed_interage_fases.sql

INSERT INTO interage_fase (id, mundo_id, numero, nome, ordem_no_mundo, conteudo_introducao_html, ativo)
VALUES

(1, 1, 1, 'Sinais Diacríticos', 1, $f1$
<h2>Sinais Diacríticos</h2>
<p>Os <strong>sinais diacríticos</strong> (ou notações léxicas) indicam a pronúncia correta das palavras. Existem três <em>acentos gráficos</em> e cinco <em>sinais</em>:</p>

<p><strong>Acentos gráficos:</strong></p>
<ul>
  <li><strong>Agudo (´)</strong> — marca a sílaba tônica com timbre <em>aberto</em>: <em>pé, café, história</em></li>
  <li><strong>Circunflexo (^)</strong> — marca a sílaba tônica com timbre <em>fechado</em>: <em>avô, mês, câmara</em></li>
  <li><strong>Grave (&#96;)</strong> — marca exclusivamente a <strong>crase</strong>: <em>Sou leal à pátria</em></li>
</ul>

<p><strong>Sinais gráficos (não são acentos!):</strong></p>
<ul>
  <li><strong>Til (~)</strong> — nasalização das vogais <em>a</em> e <em>o</em>: <em>irmã, avião, limões</em></li>
  <li><strong>Cedilha (ç)</strong> — C com som de SS: <em>ação, açúcar, reação</em></li>
  <li><strong>Apóstrofo (')</strong> — supressão de vogal: <em>caixa d''água</em></li>
  <li><strong>Trema (¨)</strong> — na nova ortografia, apenas em nomes estrangeiros e derivados: <em>Müller, Hübner</em></li>
  <li><strong>Hífen (-)</strong> — une vocábulos e liga verbos a pronomes: <em>guarda-chuva, vê-lo</em></li>
</ul>

<blockquote>⚠️ <strong>Atenção!</strong> Cada palavra recebe apenas <strong>um</strong> acento gráfico. O til <strong>não</strong> é acento gráfico — é sinal de nasalização. Em <em>órfão</em>, o circunflexo (acento gráfico) e o til (sinal) coexistem com funções distintas.</blockquote>
$f1$, true),

(2, 1, 2, 'Monossílabas Tônicas', 2, $f2$
<h2>Monossílabas Tônicas</h2>
<p>Nem toda monossílaba tônica é acentuada graficamente. A regra é simples:</p>

<p><strong>Acentuam-se as monossílabas tônicas terminadas em -a(s), -e(s) e -o(s).</strong></p>
<ul>
  <li>-a(s): <em>má, más, trás, lá, já</em></li>
  <li>-e(s): <em>pé, pés, mês, três</em></li>
  <li>-o(s): <em>só, sós, pós, dó, pôs</em></li>
</ul>

<p><strong>NÃO se acentuam</strong> monossílabas tônicas com outras terminações: <em>fim, bem, mais, vez, mar, lei, sol</em>.</p>

<blockquote>⚠️ <strong>Pronomes oblíquos átonos:</strong> Ao acentuar um verbo seguido de pronome enclítico, <strong>ignore o pronome</strong>: <em>dá-lo</em> (monossílaba -a), <em>vê-los</em> (monossílaba -e), <em>pô-lo</em> (monossílaba -o).</blockquote>

<p><strong>Monossílabas átonas</strong> nunca são acentuadas: artigos (<em>o, a</em>), preposições (<em>de, em, por</em>), conjunções (<em>e, que, mas</em>), pronomes oblíquos átonos (<em>me, te, se</em>).</p>
$f2$, true),

(3, 1, 3, 'Proparoxítonas', 3, $f3$
<h2>Proparoxítonas</h2>
<p>A proparoxítona é a palavra em que o acento tônico recai na <strong>antepenúltima sílaba</strong>.</p>
<p>A regra é absoluta: <strong>todas as proparoxítonas são acentuadas graficamente!</strong></p>

<p>Exemplos:</p>
<ul>
  <li><em>lâmpada</em> (LÂM-pa-da), <em>médico</em> (MÉ-di-co), <em>pássaro</em> (PÁS-sa-ro)</li>
  <li><em>público</em> (PÚ-bli-co), <em>álcool</em> (ÁL-co-ol), <em>náufrago</em> (NÁU-fra-go)</li>
  <li><em>música</em> (MÚ-si-ca), <em>seriíssimo</em> (se-ri-ÍS-si-mo), <em>zênite</em> (ZÊ-ni-te)</li>
</ul>

<blockquote>⚠️ <strong>Proparoxítonas eventuais:</strong> Palavras como <em>história</em> e <em>paciência</em> podem ser analisadas como paroxítonas terminadas em ditongo crescente OU como proparoxítonas eventuais. Ambas as justificativas são aceitas pelas bancas.</blockquote>

<blockquote>⚠️ <strong>Dupla grafia:</strong> Segundo o VOLP, algumas palavras latinas admitem forma com ou sem acento: <em>déficit/deficit</em>, <em>hábitat/habitat</em>. Somente as formas acentuadas fazem plural regular: <em>déficits, hábitats</em>.</blockquote>
$f3$, true),

(4, 1, 4, 'Paroxítonas', 4, $f4$
<h2>Paroxítonas</h2>
<p>A paroxítona tem o acento tônico na <strong>penúltima sílaba</strong>. É a classe mais numerosa do português.</p>

<p>Paroxítonas terminadas em <em>-a(s), -e(s), -o(s), -em, -ens</em> são a maioria — <strong>NÃO recebem acento</strong>. As demais terminações recebem acento:</p>

<ul>
  <li>Ditongo crescente/decrescente (+r): <em>história, jóquei, caráter</em></li>
  <li>-ão(s), -ã(s): <em>órgão, órfã</em></li>
  <li>-l: <em>fácil, difícil, amável</em></li>
  <li>-n: <em>hífen, glúten, pólen</em></li>
  <li>-r: <em>caráter, açúcar</em></li>
  <li>-um: <em>fórum, álbum</em></li>
  <li>-x: <em>tórax, látex</em></li>
  <li>-i, -is: <em>júri, lápis, oásis</em></li>
  <li>-us: <em>vírus, bônus, húmus</em></li>
  <li>-ps: <em>fórceps, bíceps</em></li>
</ul>

<blockquote>⚠️ <strong>Atenção!</strong> <em>Hífen</em> é acentuado (paroxítona em -n), mas <em>hifens</em> não (paroxítona em -ens). Verbos terminados em -am não são acentuados: <em>cantam, mexam</em>.</blockquote>
$f4$, true),

(5, 1, 5, 'Oxítonas', 5, $f5$
<h2>Oxítonas</h2>
<p>A oxítona tem o acento tônico na <strong>última sílaba</strong>.</p>
<p><strong>Acentuam-se as oxítonas terminadas em -a(s), -e(s), -o(s), -em e -ens.</strong></p>

<ul>
  <li>-a(s): <em>sofá, sofás, maracujá</em></li>
  <li>-e(s): <em>café, cafés, croché</em></li>
  <li>-o(s): <em>avó, avós, bongô, bongós</em></li>
  <li>-em: <em>vintém, também, ninguém, armazém</em></li>
  <li>-ens: <em>vinténs, armazéns</em></li>
</ul>

<blockquote>⚠️ <strong>Pronomes oblíquos átonos:</strong> Ignore o pronome ao acentuar: <em>comprá-las</em> (= comprá, -a), <em>revê-lo</em> (= revê, -e), <em>mantém-no</em> (= mantém, -em).</blockquote>

<p>Oxítonas com outras terminações <strong>não recebem acento</strong>: <em>rapaz, anel, batom, capim</em>.</p>
$f5$, true),

(6, 1, 6, 'Hiatos Tônicos', 6, $f6$
<h2>Hiatos Tônicos — I e U</h2>
<p>O <strong>hiato</strong> é o encontro de duas vogais em sílabas separadas. Quando as vogais <strong>I</strong> ou <strong>U</strong> são tônicas e formam hiato, acentuam-se com acento agudo:</p>
<ul>
  <li>sa-<strong>ú</strong>-de, ba-<strong>ú</strong>, fa-<strong>ís</strong>-ca, ba-la-<strong>ús</strong>-tre, a-ça-<strong>í</strong></li>
</ul>

<p><strong>Exceções importantes:</strong></p>
<ul>
  <li><strong>Seguido de Z:</strong> <em>raiz, juiz</em> — I antes de Z não recebe acento.</li>
  <li><strong>Seguido de NH:</strong> <em>rainha, campainha</em> — I antes de NH não recebe acento.</li>
  <li><strong>Paroxítona após ditongo decrescente:</strong> <em>feiura, bocaiuva</em> — sem acento (novo acordo).</li>
  <li><strong>Oxítona após ditongo:</strong> mantém o acento: <em>Piauí, tuiuiú</em>.</li>
</ul>

<blockquote>⚠️ <strong>Pronomes oblíquos:</strong> A regra continua valendo com enclíticos: <em>atribuí-lo, distribuí-la</em>.</blockquote>

<blockquote>⚠️ <strong>Proparoxítonas:</strong> A regra dos hiatos NÃO se aplica a proparoxítonas. <em>Veículos</em> é acentuado por ser proparoxítona, não pela regra dos hiatos.</blockquote>
$f6$, true);