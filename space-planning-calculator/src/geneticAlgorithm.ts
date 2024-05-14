import { Feature, Polygon, Properties, polygon } from "@turf/turf";
import { Darwin } from "charles.darwin";
import { generateOptionFromNormalizedChromosome } from "./generativeDesignEngine";
import { Footprint } from "forma-embedded-view-sdk/dist/internal/geometry";
import { getObjectiveFunctionValue } from "./objectiveFunction";

export const optimize = (
  constraints: Footprint[],
  siteLimit: Footprint,
  landOptimizationRatio: number,
  spaceBetweenBuildings: number,
  widhtRange: [number, number],
  heightRange: [number, number],
  numberOfBuildings: number,
  populationSize: number = 100,
  iterations: number = 10
) => {
  const numberOfChromosomes = numberOfBuildings * 5;

  // positions, then heights, then widths, then angles => 5 * numberOfBuildings

  const population = new Darwin<number>({
    populationSize: populationSize,
    chromosomeLength: numberOfChromosomes,
    randomGene: () => Math.random(),
  });

  const siteLimitPolygon = polygon([siteLimit.coordinates]);
  const constraintPolygons = constraints.map((constraint) =>
    polygon([constraint.coordinates])
  );

  const evalFitness = (chromosome: number[]) => {
    const option = generateOptionFromNormalizedChromosome(
      chromosome,
      siteLimit,
      widhtRange,
      heightRange,
      numberOfBuildings
    );

    const fitness = getObjectiveFunctionValue(
      option,
      siteLimitPolygon,
      constraintPolygons,
      spaceBetweenBuildings,
      landOptimizationRatio
    );

    return fitness;
  };

  for (let i = 0; i < iterations; i++) {
    population.updateFitness((genes) => evalFitness(genes));
    population.mate();
    console.log(population.getStats());
  }

  const bestChromosome = population.getTopChromosomes(1);

  return generateOptionFromNormalizedChromosome(
    bestChromosome[0].getGenes(),
    siteLimit,
    widhtRange,
    heightRange,
    numberOfBuildings
  );
};

// optimize();
