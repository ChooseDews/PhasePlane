<template>

<div class="favs">

<div class="card"  @click="select('x-y-x*(3*(x^2+y^2)-(x^2+y^2)^2-1)', 'x+y-y*(3*(x^2+y^2)-(x^2+y^2)^2-1)',[-4,4],[0.1,0.1])">

<h3>Semi-Stable Limit Cycle</h3>

<img class="f-thumb" src="./static/LimitCycle.png" />
<button @click="select('x-y-x*(3*(x^2+y^2)-(x^2+y^2)^2-1)', 'x+y-y*(3*(x^2+y^2)-(x^2+y^2)^2-1)',[-4,4],[0.1,0.1])" class="button-success pure-button button-small mt pure-button-active">View</button>

<a class="pure-button button-small mt pure-button-active" target="_blank" href="https://en.wikipedia.org/wiki/Limit_cycle">Learn More</a>



</div>
<div class="card" @click="select('y', '1*(1-x^2)*y-x',[-6,6],[0.1,0.1])">
<h3>Van der Pol oscillator</h3>

<img class="f-thumb" src="./static/VanDerPol.png" />
<button @click="select('y', '1*(1-x^2)*y-x',[-6,6],[0.1,0.1])" class="button-success pure-button button-small mt pure-button-active">View</button>

<a class="pure-button button-small mt pure-button-active" target="_blank" href="https://en.wikipedia.org/wiki/Van_der_Pol_oscillator">Learn More</a>

</div>
<div class="card" @click="select('y', '-x',[-4,4],[0.5,0.5])"><h3>y'' + y' = 0</h3>

<img class="f-thumb" src="./static/Elementary.png" />
<button @click="select('y', '-x',[-4,4],[0.5,0.5])" class="button-success pure-button button-small mt pure-button-active">View</button>

</div>

<div class="card" @click="select('y', '-y-x',[-6,6],[2,2])"><h3>y'' + y' + y = 0</h3>

<img class="f-thumb" src="./static/Elementary_2.png" />
<button @click="select('y', '-y-x',[-6,6],[2,2])" class="button-success pure-button button-small mt pure-button-active">View</button>

</div>

<div style="clear:both"></div>


<p class="forward p-2">I wrote this phase plane plotter to get a better understanding of the solutions of differential equations while studying at the University of Florida. The source code is free to use and modify, and can be found on <a target="_blank" href="https://github.com/ChooseDews/PhasePlane">Github</a>.

<br><br>

<b>Entry Tips:</b>

While entering equations or ranges be sure to explicitly define multiplication operations. Example: y' = 2(x^2-1) should be written y' = 2*(x^2-1). For full documentation on allowed operators and functions see <a target="_blank" href="https://mathjs.org/index.html">MathJS parsing</a>


</p>


</div> 

</template>


<script>


export default {
    methods: {
        select(x_p, y_p, x_range, p_start){
            this.$emit('select', x_p, y_p, x_range, p_start);
        }
    }
}

</script>


<style scoped>

.forward{
    max-width: 600px;
    margin: auto;
}

.card{
    float: left;
    max-width: 400px;
    margin: 10px;
    border: 1px solid black;
    padding: 15px;
    text-align: center;
}

.card:hover{
    border: 1px dashed #a6a6a6;
}

h3{
    text-align: center;
}


h1{
    margin: 0;
    padding: 0;
}



.favs{
width: 100%;
min-height: 100px;
color: white;
padding: 20px;
}

.f-thumb{
    max-width: 250px;
    width: 100%;
    display: block;
}



    .mt{
                   margin-top: 10px;
 
    }

   

</style>