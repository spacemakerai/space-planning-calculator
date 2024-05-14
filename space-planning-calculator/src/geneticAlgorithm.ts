import { Darwin } from "charles.darwin";



export const optimize = () => {
    const population = new Darwin<number>({
        populationSize: 100,
        chromosomeLength: 10,
        randomGene: () => Math.random() * 10,
    });
    console.log(population);

    const evalFitness = (chromosome: number[]) => {
        return chromosome.reduce((acc, gene) => acc + gene**2, 0);
    }

      

      for (let i = 0; i < 2000; i++) {
        population.updateFitness(genes => evalFitness(genes));
        population.mate();

        // const {
        //     fittest,
        //     fittestIndex,
        //     averageFitness,
        //     totalFitness
        //   } = population.updateStats();
          console.log(population.getStats())
      }

      console.log(population.getStats())
}


// optimize();
